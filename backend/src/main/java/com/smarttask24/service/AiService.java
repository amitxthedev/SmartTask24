package com.smarttask24.service;

import com.smarttask24.ai.OllamaClient;
import com.smarttask24.dto.request.CategoryRequest;
import com.smarttask24.dto.request.NoteRequest;
import com.smarttask24.dto.request.SubTaskRequest;
import com.smarttask24.dto.request.TagRequest;
import com.smarttask24.dto.request.TaskRequest;
import com.smarttask24.dto.response.AiConversationResponse;
import com.smarttask24.dto.response.CategoryResponse;
import com.smarttask24.dto.response.NoteResponse;
import com.smarttask24.dto.response.TagResponse;
import com.smarttask24.dto.response.TaskResponse;
import com.smarttask24.entity.Priority;
import com.smarttask24.entity.User;
import com.smarttask24.repository.CategoryRepository;
import com.smarttask24.repository.TagRepository;
import com.smarttask24.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final OllamaClient ollamaClient;
    private final TaskService taskService;
    private final CategoryService categoryService;
    private final TagService tagService;
    private final NoteService noteService;
    private final AiConversationService conversationService;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    private static final int CONVERSATION_MEMORY_SIZE = 5;

    public AiConversationResponse processPrompt(String prompt, String email, String timezone, String weatherContext, String profileContext) {
        String lower = prompt.toLowerCase().trim();
        log.info("AI prompt: {} | profile: {} | timezone: {}", lower, profileContext, timezone);
        final String tz = timezone;
        final String weather = weatherContext != null ? weatherContext : "";
        final String profile = profileContext != null ? profileContext : "";

        // ===== PLAN MY DAY =====
        if (containsAny(lower, "plan my day", "daily plan", "today's plan", "what should i do today",
            "make a plan for today", "schedule my day", "organize my day", "create my day",
            "plan day", "plan today")) {
            return handlePlanMyDay(prompt, email, tz, weather, profile);
        }

        // ===== SUGGEST / RECOMMEND =====
        if (containsAny(lower, "suggest", "recommend", "ideas for", "what tasks should",
            "what should i work on", "what should i focus", "what should i do",
            "give me ideas", "help me plan", "help me decide", "what can i do",
            "what do you suggest", "what do you recommend", "any suggestions",
            "how should i", "prioritize", "what's important", "what's urgent")) {
            return handleSuggest(prompt, lower, email, tz);
        }

        // ===== DELETE ALL / CLEAR =====
        if (containsAny(lower, "delete all", "remove all", "clear all", "erase all", "trash all",
            "delete everything", "remove everything", "clear everything",
            "delete my tasks", "remove my tasks", "clear my tasks")) {
            return handleDeleteAllTasks(prompt, email);
        }

        // ===== UPDATE ALL tasks =====
        if (containsAny(lower, "update all task", "update all my task", "change all task", "update every task")) {
            return handleUpdateAllTasks(prompt, lower, email);
        }

        // ===== DELETE single item =====
        if (startsWithAny(lower, "delete ", "remove ", "trash ", "erase ", "get rid of ")) {
            if (containsAny(lower, "note", "notes")) return handleDeleteNote(prompt, lower, email);
            if (containsAny(lower, "tag", "tags")) return handleDeleteTag(prompt, lower, email);
            if (containsAny(lower, "categor")) return handleDeleteCategory(prompt, lower, email);
            return handleDeleteTask(prompt, lower, email);
        }

        // ===== COMPLETE task =====
        if (startsWithAny(lower, "complete ", "done ", "finish ", "mark done ", "mark as done ", "check off ")) {
            return handleCompleteTask(prompt, lower, email);
        }

        // ===== LIST =====
        if (containsAny(lower, "show notes", "list notes", "my notes", "view notes", "see notes")) {
            return handleListNotes(prompt, email);
        }
        if (containsAny(lower, "show tasks", "list tasks", "my tasks", "view tasks", "see tasks",
            "show my tasks", "list my tasks", "view my tasks", "all tasks",
            "what are my tasks", "what tasks", "show todos", "list todos", "my todos")) {
            return handleListTasks(prompt, email, tz);
        }
        if (containsAny(lower, "show categories", "list categories", "my categories", "view categories")) {
            return handleListCategories(prompt, email);
        }
        if (containsAny(lower, "show tags", "list tags", "my tags", "view tags")) {
            return handleListTags(prompt, email);
        }

        // ===== ANALYZE =====
        if (containsAny(lower, "analyze", "analyse", "productivity", "stats", "statistics",
            "progress report", "overview", "how am i doing", "performance")) {
            return handleAnalyze(prompt, email, tz);
        }

        // ===== CREATE note(s) =====
        if (containsAny(lower, "note", "notes") && containsAny(lower, "create", "add", "make", "new", "write")) {
            return handleCreateNotes(prompt, lower, email);
        }

        // ===== CREATE category/categories =====
        if (containsAny(lower, "categor") && containsAny(lower, "create", "add", "make", "new")) {
            return handleCreateCategories(prompt, lower, email);
        }

        // ===== CREATE tag(s) — MUST be before generic "add" check =====
        if (containsAny(lower, "tag", "tags") && containsAny(lower, "create", "add", "make", "new")) {
            return handleCreateTags(prompt, lower, email);
        }

        // ===== CREATE TASKS FOR ALL SUBJECTS (from profile) =====
        if (containsAny(lower, "all subjects", "my subjects", "every subject", "each subject", "subjects")
            && containsAny(lower, "create", "add", "make", "task", "study")) {
            return handleCreateTasksForAllSubjects(prompt, lower, email, tz, profile);
        }

        // ===== CREATE task(s) — generic "add/create/make" =====
        if (startsWithAny(lower, "create", "add", "make", "new task", "schedule", "set up")
            || containsAny(lower, "i need", "i want", "i have to", "can you create", "can you add",
               "please create", "please add", "bana ke do", "banao", "banado")) {
            return handleCreateTaskSmart(prompt, lower, email, tz, profile);
        }

        // ===== UPDATE task =====
        if (startsWithAny(lower, "update ", "edit ", "rename ", "change ")) {
            return handleUpdateTask(prompt, lower, email);
        }

        // ===== WHAT ARE MY SUBJECTS =====
        if (isAskingSubjects(lower)) {
            return handleSubjectsQuery(prompt, email, profile);
        }

        // ===== PROFILE INFO QUERIES =====
        if (isAskingProfileInfo(lower)) {
            return handleProfileInfoQuery(prompt, email, profile);
        }

        // ===== CASUAL / NATURAL CONVERSATION =====
        if (isCasualConversation(lower)) {
            return handleCasualChat(prompt, email, tz, weather, profile);
        }

        // ===== Everything else → Chat with Gemini =====
        return handleChat(prompt, email, tz, weather, profile);
    }

    private boolean startsWithAny(String lower, String... prefixes) {
        for (String p : prefixes) {
            if (lower.startsWith(p)) return true;
        }
        return false;
    }

    private boolean containsAny(String lower, String... patterns) {
        for (String p : patterns) {
            if (lower.contains(p)) return true;
        }
        return false;
    }

    private LocalDateTime nowInTimezone(String timezone) {
        try {
            return LocalDateTime.now(java.time.ZoneId.of(timezone));
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    // =====================================================================
    // DELETE ALL TASKS
    // =====================================================================

    private AiConversationResponse handleDeleteAllTasks(String prompt, String email) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        if (tasks.isEmpty()) {
            return conversationService.saveConversation(prompt, "You don't have any tasks to delete.", email);
        }

        int count = 0;
        for (TaskResponse t : tasks) {
            try {
                taskService.deleteTask(t.getId(), email);
                count++;
            } catch (Exception e) {
                log.error("Failed to delete task {}: {}", t.getId(), e.getMessage());
            }
        }

        return conversationService.saveConversation(prompt,
            "Done! Deleted " + count + " task(s). Your task list is now clean.", email);
    }

    // =====================================================================
    // DELETE SINGLE TASK
    // =====================================================================

    private AiConversationResponse handleDeleteTask(String prompt, String lower, String email) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        if (tasks.isEmpty()) {
            return conversationService.saveConversation(prompt, "You don't have any tasks to delete.", email);
        }

        String searchTitle = extractTargetTaskName(prompt);
        TaskResponse match = fuzzyFind(searchTitle, tasks);

        if (match == null) {
            return conversationService.saveConversation(prompt,
                "Couldn't find a task matching \"" + searchTitle + "\".\n\nYour tasks:\n" + formatTaskList(tasks), email);
        }

        try {
            taskService.deleteTask(match.getId(), email);
            return conversationService.saveConversation(prompt, "Deleted task: " + match.getTitle(), email);
        } catch (Exception e) {
            return conversationService.saveConversation(prompt, "Failed to delete task.", email);
        }
    }

    // =====================================================================
    // COMPLETE TASK
    // =====================================================================

    private AiConversationResponse handleCompleteTask(String prompt, String lower, String email) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        if (tasks.isEmpty()) {
            return conversationService.saveConversation(prompt, "You don't have any tasks to complete.", email);
        }

        String searchTitle = extractTargetTaskName(prompt);
        TaskResponse match = fuzzyFind(searchTitle, tasks);

        if (match == null) {
            return conversationService.saveConversation(prompt,
                "Couldn't find a task matching \"" + searchTitle + "\".\n\nYour tasks:\n" + formatTaskList(tasks), email);
        }

        try {
            taskService.completeTask(match.getId(), email);
            return conversationService.saveConversation(prompt, "Task completed: " + match.getTitle() + " Nice work!", email);
        } catch (Exception e) {
            return conversationService.saveConversation(prompt, "Failed to complete task.", email);
        }
    }

    // =====================================================================
    // LIST TASKS
    // =====================================================================

    private AiConversationResponse handleListTasks(String prompt, String email, String timezone) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        if (tasks.isEmpty()) {
            return conversationService.saveConversation(prompt, "You don't have any tasks yet. Want me to create one?", email);
        }

        LocalDateTime now = nowInTimezone(timezone);
        long pending = tasks.stream().filter(t -> t.getStatus().toString().equals("PENDING")).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus().toString().equals("IN_PROGRESS")).count();
        long completed = tasks.stream().filter(t -> t.getStatus().toString().equals("COMPLETED")).count();
        long overdue = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) && !t.getStatus().toString().equals("COMPLETED")).count();
        long dueToday = tasks.stream().filter(t -> t.getDueDate() != null && !t.getDueDate().isBefore(now) && t.getDueDate().toLocalDate().equals(now.toLocalDate()) && !t.getStatus().toString().equals("COMPLETED")).count();
        long dueTomorrow = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().equals(now.plusDays(1).toLocalDate()) && !t.getStatus().toString().equals("COMPLETED")).count();

        StringBuilder sb = new StringBuilder();
        sb.append("You have ").append(tasks.size()).append(" task(s)\n");
        sb.append("Pending: ").append(pending).append(" | In Progress: ").append(inProgress).append(" | Done: ").append(completed);
        if (overdue > 0) sb.append(" | 🚨 Overdue: ").append(overdue);
        if (dueToday > 0) sb.append(" | ⏰ Due Today: ").append(dueToday);
        if (dueTomorrow > 0) sb.append(" | 🔔 Due Tomorrow: ").append(dueTomorrow);
        sb.append("\n\n");

        // === OVERDUE (most urgent) ===
        List<TaskResponse> overdueTasks = tasks.stream()
            .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) && !t.getStatus().toString().equals("COMPLETED"))
            .sorted(Comparator.comparing(TaskResponse::getDueDate))
            .toList();
        if (!overdueTasks.isEmpty()) {
            sb.append("🚨 OVERDUE:\n");
            overdueTasks.forEach(t -> {
                long hours = java.time.Duration.between(t.getDueDate(), now).toHours();
                long days = java.time.Duration.between(t.getDueDate(), now).toDays();
                sb.append("  [").append(t.getId()).append("] ").append(t.getTitle())
                   .append(" (").append(t.getPriority()).append(")")
                   .append(" — was due: ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, h:mm a")));
                if (days > 0) sb.append(" — ").append(days).append("d OVERDUE!");
                else sb.append(" — ").append(hours).append("h OVERDUE!");
                sb.append("\n");
            });
            sb.append("\n");
        }

        // === DUE TODAY (urgent) ===
        List<TaskResponse> dueTodayTasks = tasks.stream()
            .filter(t -> t.getDueDate() != null && !t.getDueDate().isBefore(now) && t.getDueDate().toLocalDate().equals(now.toLocalDate()) && !t.getStatus().toString().equals("COMPLETED"))
            .sorted(Comparator.comparing(TaskResponse::getDueDate))
            .toList();
        if (!dueTodayTasks.isEmpty()) {
            sb.append("⏰ DUE TODAY:\n");
            dueTodayTasks.forEach(t -> {
                long hoursLeft = java.time.Duration.between(now, t.getDueDate()).toHours();
                long minsLeft = java.time.Duration.between(now, t.getDueDate()).toMinutes() % 60;
                sb.append("  [").append(t.getId()).append("] ").append(t.getTitle())
                   .append(" (").append(t.getPriority()).append(")")
                   .append(" — due at ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("h:mm a")));
                if (hoursLeft <= 2) sb.append(" — ⚠️ LESS THAN 2 HOURS LEFT!");
                else if (hoursLeft <= 6) sb.append(" — ⚠️ ").append(hoursLeft).append("h ").append(minsLeft).append("m left");
                else sb.append(" — ").append(hoursLeft).append("h left");
                sb.append("\n");
            });
            sb.append("\n");
        }

        // === DUE TOMORROW ===
        List<TaskResponse> dueTomorrowTasks = tasks.stream()
            .filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().equals(now.plusDays(1).toLocalDate()) && !t.getStatus().toString().equals("COMPLETED"))
            .sorted(Comparator.comparing(TaskResponse::getDueDate))
            .toList();
        if (!dueTomorrowTasks.isEmpty()) {
            sb.append("🔔 DUE TOMORROW:\n");
            dueTomorrowTasks.forEach(t ->
                sb.append("  [").append(t.getId()).append("] ").append(t.getTitle())
                   .append(" (").append(t.getPriority()).append(")")
                   .append(" — due ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("h:mm a"))).append("\n"));
            sb.append("\n");
        }

        // === OTHER ACTIVE TASKS ===
        List<TaskResponse> active = tasks.stream()
            .filter(t -> !t.getStatus().toString().equals("COMPLETED") && !t.getStatus().toString().equals("ARCHIVED"))
            .filter(t -> t.getDueDate() == null || t.getDueDate().isAfter(now.plusDays(1).toLocalDate().atTime(23, 59)))
            .toList();
        if (!active.isEmpty()) {
            sb.append("Active tasks:\n");
            active.forEach(t -> {
                sb.append("  [").append(t.getId()).append("] ").append(t.getTitle())
                   .append(" (").append(t.getPriority()).append(")");
                if (t.getDueDate() != null) {
                    sb.append(" — Due: ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, h:mm a")));
                    long daysUntil = java.time.Duration.between(now, t.getDueDate()).toDays();
                    if (daysUntil <= 7) sb.append(" (").append(daysUntil).append("d)");
                }
                sb.append("\n");
            });
        }

        // === COMPLETED ===
        List<TaskResponse> doneTasks = tasks.stream()
            .filter(t -> t.getStatus().toString().equals("COMPLETED"))
            .toList();
        if (!doneTasks.isEmpty()) {
            sb.append("\nCompleted:\n");
            doneTasks.stream().limit(5).forEach(t -> sb.append("  done ").append(t.getTitle()).append("\n"));
            if (doneTasks.size() > 5) sb.append("  ... and ").append(doneTasks.size() - 5).append(" more\n");
        }

        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // CREATE TASK — Smart: uses Gemini for title extraction if complex
    // =====================================================================

    // =====================================================================
    // CREATE TASKS FOR ALL SUBJECTS (from profile)
    // =====================================================================

    private AiConversationResponse handleCreateTasksForAllSubjects(String prompt, String lower, String email, String tz, String profile) {
        List<String> subjects = getSubjectsForProfile(profile);

        if (subjects.isEmpty()) {
            return conversationService.saveConversation(prompt,
                "I don't have your subjects yet! Please set your profile first:\n\n"
                + "Click the **Profile** button in the topbar and set:\n"
                + "- University\n- Course\n- Stream\n- Semester\n\n"
                + "Then I can create tasks for all your subjects!", email);
        }

        // Parse time range from prompt (e.g., "from 9am to 9pm")
        int startHour = 9;
        int endHour = 21;
        Matcher timeRange = Pattern.compile("(\\d{1,2})\\s*(am|pm)?\\s*(?:to|-)\\s*(\\d{1,2})\\s*(am|pm)?", Pattern.CASE_INSENSITIVE).matcher(lower);
        if (timeRange.find()) {
            startHour = Integer.parseInt(timeRange.group(1));
            String startAmpm = timeRange.group(2);
            endHour = Integer.parseInt(timeRange.group(3));
            String endAmpm = timeRange.group(4);
            if (startAmpm != null && startAmpm.toLowerCase().startsWith("pm") && startHour < 12) startHour += 12;
            if (startAmpm != null && startAmpm.toLowerCase().startsWith("am") && startHour == 12) startHour = 0;
            if (endAmpm != null && endAmpm.toLowerCase().startsWith("pm") && endHour < 12) endHour += 12;
            if (endAmpm != null && endAmpm.toLowerCase().startsWith("am") && endHour == 12) endHour = 0;
        }

        // Calculate time per subject
        int totalHours = endHour - startHour;
        if (totalHours <= 0) totalHours = 12;
        int minutesPerSubject = (totalHours * 60) / subjects.size();
        if (minutesPerSubject < 30) minutesPerSubject = 30;

        LocalDateTime userNow = nowInTimezone(tz);
        LocalDateTime currentTime = userNow.withHour(startHour).withMinute(0).withSecond(0);
        if (currentTime.isBefore(userNow)) currentTime = userNow;

        List<TaskResponse> created = new ArrayList<>();
        StringBuilder response = new StringBuilder();
        response.append("**📚 Study Schedule - All Subjects**\n");
        response.append("From ").append(formatHour(startHour)).append(" to ").append(formatHour(endHour)).append("\n\n");

        for (int i = 0; i < subjects.size(); i++) {
            String subject = subjects.get(i);
            LocalDateTime taskTime = currentTime.plusMinutes(i * minutesPerSubject);
            LocalDateTime taskEnd = taskTime.plusMinutes(minutesPerSubject);

            try {
                TaskRequest request = new TaskRequest();
                request.setTitle("Study: " + subject);
                request.setPriority(Priority.MEDIUM);
                request.setDueDate(taskTime);
                TaskResponse task = taskService.createTask(request, email);
                created.add(task);

                response.append(formatHour(taskTime.getHour()) + " - " + formatHour(taskEnd.getHour()) + ": ")
                    .append("**").append(subject).append("**\n");
            } catch (Exception e) {
                log.error("Failed to create task for subject: {}", subject);
            }
        }

        response.append("\n---\n");
        response.append("**").append(created.size()).append("** tasks created! Say **\"mark done [task]\"** as you complete each one. 💪");

        return conversationService.saveConversation(prompt, response.toString(), email);
    }

    private String formatHour(int hour24) {
        int h = hour24 % 12;
        if (h == 0) h = 12;
        String ampm = hour24 >= 12 ? "PM" : "AM";
        return h + ":00 " + ampm;
    }

    private AiConversationResponse handleCreateTaskSmart(String prompt, String lower, String email, String tz, String profile) {
        // Multi-task with count: "create 10 tasks", "add 5 todos", "create 10 tasks like..."
        if (lower.matches(".*\\b(\\d+)\\s+(tasks?|todos?|reminders?|items?)\\b.*")) {
            return handleCreateMultipleTasksWithCount(prompt, lower, email, tz, profile);
        }

        // Simple case: "create task called X" or "add task X" (short prompt)
        if (lower.length() < 100 && (lower.startsWith("create task") || lower.startsWith("add task") || lower.startsWith("make task"))) {
            return handleCreateSingleTask(prompt, lower, email, tz);
        }

        // Complex single task with natural language: "i have to do lunch at 10am"
        // Use Gemini to extract the actual task title
        return handleCreateSingleTaskWithGemini(prompt, email, tz, profile);
    }

    private AiConversationResponse handleCreateSingleTask(String prompt, String lower, String email, String tz) {
        String title = extractTaskTitle(prompt);
        if (title.isEmpty() || title.length() < 2) title = "New Task";

        TaskRequest request = new TaskRequest();
        request.setTitle(capitalizeFirst(title));
        request.setPriority(extractPriority(lower));
        request.setEstimatedTime(extractTime(lower));
        request.setDueDate(extractDueDate(prompt, tz));

        List<SubTaskRequest> subtasks = extractSubtasks(prompt);
        if (!subtasks.isEmpty()) request.setSubtasks(subtasks);

        Long categoryId = extractCategory(prompt, email);
        if (categoryId != null) request.setCategoryId(categoryId);

        Set<Long> tagIds = extractTags(prompt, email);
        if (!tagIds.isEmpty()) request.setTagIds(tagIds);

        try {
            TaskResponse created = taskService.createTask(request, email);
            return conversationService.saveConversation(prompt, formatCreatedTask(created), email);
        } catch (Exception e) {
            log.error("Failed to create task", e);
            return conversationService.saveConversation(prompt, "Failed to create task: " + e.getMessage(), email);
        }
    }

    private AiConversationResponse handleCreateSingleTaskWithGemini(String prompt, String email, String tz, String profile) {
        String profileInfo = profile != null && !profile.isEmpty() ? "\nUser's academic profile: " + profile : "";
        String geminiPrompt = "You are SmartTask24 AI. Extract a single SHORT task title from this message. Return ONLY the title, nothing else.\n"
            + profileInfo + "\n"
            + "User said: \"" + prompt + "\"\n"
            + "Rules:\n"
            + "- Max 40 characters\n"
            + "- ALWAYS respond in English — even if user writes in Hindi\n"
            + "- If user wrote in Hindi, translate to English\n"
            + "- Make it actionable (e.g. 'Have lunch at 10 AM' not 'I will have to done my lunch')\n"
            + "- Include time if mentioned\n"
            + "- If user is a student, make the task specific to their course/subject\n"
            + "- Example: 'i have to done my lunch at 10 am' -> Lunch at 10:00 AM\n"
            + "- Example: 'call mom tomorrow' -> Call mom tomorrow\n"
            + "- Return ONLY the title";

        String title = ollamaClient.chat(geminiPrompt).trim()
            .replaceAll("\\*\\*", "")
            .replaceAll("^\"|\"$", "")
            .replaceAll("^Task:\\s*", "")
            .replaceAll("^Title:\\s*", "");
        if (title.isEmpty() || title.length() < 2) title = extractTaskTitle(prompt);
        if (title.length() > 100) title = title.substring(0, 100);

        TaskRequest request = new TaskRequest();
        request.setTitle(capitalizeFirst(title));
        request.setPriority(extractPriority(prompt.toLowerCase()));
        request.setDueDate(extractDueDate(prompt, tz));

        try {
            TaskResponse created = taskService.createTask(request, email);
            return conversationService.saveConversation(prompt, formatCreatedTask(created), email);
        } catch (Exception e) {
            log.error("Failed to create task", e);
            return conversationService.saveConversation(prompt, "Failed to create task: " + e.getMessage(), email);
        }
    }

    private AiConversationResponse handleCreateMultipleTasksWithCount(String prompt, String lower, String email, String tz, String profile) {
        Matcher countMatcher = Pattern.compile("(\\d+)\\s+(tasks?|todos?|reminders?|items?)").matcher(lower);
        int count = 1;
        if (countMatcher.find()) {
            count = Math.min(Integer.parseInt(countMatcher.group(1)), 20);
        }

        // Use Gemini to extract meaningful titles with times
        String titles = askGeminiForTitles(prompt, count, email, profile);
        String[] titleArray = titles.split("\\|");

        List<TaskResponse> created = new ArrayList<>();
        for (int i = 0; i < count && i < titleArray.length; i++) {
            String cleanTitle = titleArray[i].trim().replaceAll("^[-*]\\s*", "").replaceAll("^\\d+\\.\\s*", "");
            if (cleanTitle.isEmpty() || cleanTitle.length() < 2) continue;
            if (cleanTitle.length() > 100) cleanTitle = cleanTitle.substring(0, 100);

            try {
                TaskRequest request = new TaskRequest();
                // Extract time from title (e.g. "9:00 AM - Study Data Structures")
                LocalDateTime titleDate = extractDueDate(cleanTitle, tz);
                LocalDateTime promptDate = extractDueDate(prompt, tz);
                LocalDateTime finalDate = titleDate != null ? titleDate : promptDate;
                // Remove time portion from title for cleaner display
                String displayTitle = cleanTitle.replaceAll("(?i)\\s*\\d{1,2}:\\d{2}\\s*(AM|PM|am|pm)?\\s*[-–—]\\s*", "").trim();
                if (displayTitle.isEmpty()) displayTitle = cleanTitle;
                request.setTitle(capitalizeFirst(displayTitle));
                request.setPriority(Priority.MEDIUM);
                if (finalDate != null) request.setDueDate(finalDate);
                created.add(taskService.createTask(request, email));
            } catch (Exception e) {
                log.error("Failed to create task {}: {}", cleanTitle, e.getMessage());
            }
        }

        if (created.isEmpty()) {
            // Fallback: create generic tasks
            for (int i = 1; i <= count; i++) {
                try {
                    TaskRequest request = new TaskRequest();
                    request.setTitle("Task " + i);
                    request.setPriority(Priority.MEDIUM);
                    created.add(taskService.createTask(request, email));
                } catch (Exception e) { /* ignore */ }
            }
        }

        return conversationService.saveConversation(prompt, formatCreatedTasks(created), email);
    }

    private AiConversationResponse handleCreateTasksWithGemini(String prompt, String email) {
        // Ask Gemini to extract task titles from natural language
        String titles = askGeminiForTitles(prompt, 10, email);
        String[] titleArray = titles.split("\\|");

        LocalDateTime dueDate = extractDueDate(prompt);

        List<TaskResponse> created = new ArrayList<>();
        for (String rawTitle : titleArray) {
            String cleanTitle = rawTitle.trim().replaceAll("^[-*]\\s*", "").replaceAll("^\\d+\\.\\s*", "");
            if (cleanTitle.isEmpty() || cleanTitle.length() < 2) continue;
            if (cleanTitle.length() > 100) cleanTitle = cleanTitle.substring(0, 100);

            // Try to extract time from the title itself (e.g. "Meeting at 3:00 PM")
            LocalDateTime titleDueDate = extractDueDate(cleanTitle);
            LocalDateTime finalDueDate = titleDueDate != null ? titleDueDate : dueDate;

            try {
                TaskRequest request = new TaskRequest();
                request.setTitle(capitalizeFirst(cleanTitle.replaceAll("(?i)\\bat\\s+\\d.*", "").trim()));
                request.setPriority(Priority.MEDIUM);
                if (finalDueDate != null) request.setDueDate(finalDueDate);
                created.add(taskService.createTask(request, email));
            } catch (Exception e) {
                log.error("Failed to create task {}: {}", cleanTitle, e.getMessage());
            }
        }

        if (created.isEmpty()) {
            // Absolute fallback
            String fallbackTitle = extractTaskTitle(prompt);
            if (fallbackTitle.length() < 2) fallbackTitle = "New Task";
            try {
                TaskRequest request = new TaskRequest();
                request.setTitle(capitalizeFirst(fallbackTitle));
                request.setPriority(Priority.MEDIUM);
                if (dueDate != null) request.setDueDate(dueDate);
                created.add(taskService.createTask(request, email));
            } catch (Exception e) { /* ignore */ }
        }

        return conversationService.saveConversation(prompt, formatCreatedTasks(created), email);
    }

    private String askGeminiForTitles(String prompt, int expectedCount, String email) {
        return askGeminiForTitles(prompt, expectedCount, email, "");
    }

    private String askGeminiForTitles(String prompt, int expectedCount, String email, String profileContext) {
        String taskContext = buildMinimalTaskContext(email);
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a"));
        String profileInfo = profileContext != null && !profileContext.isEmpty() ? "\nUser's academic profile: " + profileContext : "";

        String geminiPrompt = "You are SmartTask24 AI, an intelligent task generator for students and professionals.\n"
            + "Current date/time: " + now + profileInfo + "\n"
            + "User's existing tasks: " + taskContext + "\n\n"
            + "User wants to create " + expectedCount + " tasks.\n"
            + "User said: \"" + prompt + "\"\n\n"
            + "RULES:\n"
            + "- Generate exactly " + expectedCount + " task titles\n"
            + "- If user has academic profile, generate SUBJECT-SPECIFIC tasks relevant to their course/semester/stream\n"
            + "- For CSE students: include topics like Data Structures, Algorithms, OS, DBMS, CN, Web Dev, Python, Java, Compiler Design, AI/ML, Discrete Math, Probability, TOC, Software Engineering\n"
            + "- If the user gives a TIME RANGE (e.g. '9am to 12am'), distribute tasks EQUALLY across that range and include the start time in each title like '9:00 AM - Study Data Structures'\n"
            + "- If the user gives specific times (8am, 3pm), include times in titles\n"
            + "- If the user mentions a subject, generate tasks covering different topics within that subject\n"
            + "- If the user gives vague input, generate reasonable tasks based on their profile context\n"
            + "- Each title must be SHORT (max 50 chars) and specific\n"
            + "- NEVER use the user's full message as a task title\n"
            + "- NEVER return just 1 task when they asked for " + expectedCount + "\n"
            + "- ALWAYS output titles in English\n\n"
            + "EXAMPLES:\n"
            + "User (CSE 7th sem): 'create 10 tasks from 9am to 12am for studying' -> 9:00 AM - DS: Trees & Graphs | 10:30 AM - Algorithm: Sorting | 12:00 PM - OS: Deadlock | 1:30 PM - DBMS: Normalization | 3:00 PM - CN: TCP/IP | 4:30 PM - Web Dev: React | 6:00 PM - Python: Leetcode | 7:30 PM - Java: OOPs | 9:00 PM - Compiler Design | 10:30 PM - AI/ML Basics\n"
            + "User: 'create 5 tasks for OS' -> Process Scheduling Lab | Virtual Memory Notes | Deadlock Prevention Practice | CPU Scheduling Algorithms | Memory Management Assignment\n"
            + "User: 'create 3 meeting tasks' -> Team standup | Client call | Project review\n\n"
            + "Return ONLY titles separated by ' | '. No other text.";

        String response = ollamaClient.chat(geminiPrompt);
        log.info("Gemini title extraction: {}", response);

        response = response.replaceAll("\\*\\*", "").replaceAll("\\n", " ").trim();
        response = response.replaceAll("(?i)^(tasks?|here\\s+(are|is)\\s+(the\\s+)?tasks?|created\\s+tasks?|here\\s+are)\\s*:?", "").trim();

        return response;
    }

    // =====================================================================
    // AUTO-FETCH DIAGRAMS FROM WIKIPEDIA/WIKIMEDIA
    // =====================================================================

    private String autoFetchDiagrams(String title, String content) {
        try {
            String searchQuery = title.replaceAll("(?i)^(what\\s+is|how\\s+(does|do)|explain|define|notes?\\s+on?|note\\s+on)\\s*", "").trim();
            if (searchQuery.isEmpty()) searchQuery = title;

            List<String> imageUrls = new ArrayList<>();

            // Fetch from Wikipedia
            try {
                org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
                String wikiUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/" + java.net.URLEncoder.encode(searchQuery, "UTF-8");
                org.springframework.http.ResponseEntity<java.util.Map> wikiRes = rt.getForEntity(wikiUrl, java.util.Map.class);
                if (wikiRes.getBody() != null) {
                    java.util.Map thumbnail = (java.util.Map) wikiRes.getBody().get("thumbnail");
                    if (thumbnail != null && thumbnail.get("source") != null) {
                        String imgUrl = thumbnail.get("source").toString();
                        if (!imgUrl.isEmpty()) imageUrls.add(imgUrl);
                    }
                }
            } catch (Exception e) {
                log.debug("Wikipedia fetch failed for: {}", searchQuery);
            }

            // Fetch from Wikimedia Commons
            try {
                org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
                String commonsUrl = "https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch="
                    + java.net.URLEncoder.encode(searchQuery + " diagram", "UTF-8")
                    + "&srnamespace=6&srlimit=3&format=json";
                org.springframework.http.ResponseEntity<java.util.Map> commonsRes = rt.getForEntity(commonsUrl, java.util.Map.class);
                if (commonsRes.getBody() != null) {
                    java.util.Map query = (java.util.Map) commonsRes.getBody().get("query");
                    if (query != null) {
                        java.util.List<java.util.Map> results = (java.util.List<java.util.Map>) query.get("search");
                        if (results != null) {
                            for (java.util.Map item : results) {
                                String fileTitle = item.get("title").toString().replace("File:", "");
                                if (fileTitle.matches("(?i).*\\.(png|jpg|jpeg|svg)$")) {
                                    String imgUrl = "https://commons.wikimedia.org/wiki/Special:FilePath/"
                                        + java.net.URLEncoder.encode(fileTitle, "UTF-8");
                                    imageUrls.add(imgUrl);
                                    if (imageUrls.size() >= 3) break;
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.debug("Wikimedia fetch failed for: {}", searchQuery);
            }

            // Append images to content
            if (!imageUrls.isEmpty()) {
                StringBuilder sb = new StringBuilder(content);
                sb.append("\n\n---\n\n");
                for (int i = 0; i < imageUrls.size(); i++) {
                    sb.append("![Diagram").append(i + 1).append("](").append(imageUrls.get(i)).append(")\n\n");
                }
                content = sb.toString();
                log.info("Auto-fetched {} diagrams for: {}", imageUrls.size(), title);
            }
        } catch (Exception e) {
            log.debug("autoFetchDiagrams failed: {}", e.getMessage());
        }
        return content;
    }

    private String buildMinimalTaskContext(String email) {
        try {
            List<TaskResponse> tasks = taskService.getUserTasks(email);
            if (tasks.isEmpty()) return "(none)";
            return tasks.size() + " tasks total";
        } catch (Exception e) {
            return "(unknown)";
        }
    }

    // =====================================================================
    // UPDATE TASK
    // =====================================================================

    private AiConversationResponse handleUpdateTask(String prompt, String lower, String email) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        if (tasks.isEmpty()) {
            return conversationService.saveConversation(prompt, "You don't have any tasks to update.", email);
        }

        String searchTitle = extractTargetTaskName(prompt);
        TaskResponse match = fuzzyFind(searchTitle, tasks);

        if (match == null) {
            return conversationService.saveConversation(prompt,
                "Couldn't find a task matching \"" + searchTitle + "\".\n\nYour tasks:\n" + formatTaskList(tasks), email);
        }

        String newTitle = extractNewTitle(prompt);
        Priority newPriority = extractPriority(lower);
        LocalDateTime newDueDate = extractDueDate(prompt);

        try {
            TaskRequest req = new TaskRequest();
            req.setTitle(newTitle != null ? newTitle : match.getTitle());
            req.setDescription(match.getDescription());
            req.setPriority(newPriority != null ? newPriority : match.getPriority());
            req.setDueDate(newDueDate != null ? newDueDate : match.getDueDate());
            req.setEstimatedTime(match.getEstimatedTime());
            taskService.updateTask(match.getId(), req, email);

            StringBuilder sb = new StringBuilder();
            sb.append("Task updated!\n");
            if (newTitle != null) sb.append(match.getTitle()).append(" -> ").append(newTitle).append("\n");
            if (newPriority != null) sb.append("Priority -> ").append(newPriority).append("\n");
            if (newDueDate != null) sb.append("Due date -> ").append(newDueDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy"))).append("\n");
            return conversationService.saveConversation(prompt, sb.toString(), email);
        } catch (Exception e) {
            return conversationService.saveConversation(prompt, "Failed to update task.", email);
        }
    }

    // =====================================================================
    // UPDATE ALL TASKS
    // =====================================================================

    private AiConversationResponse handleUpdateAllTasks(String prompt, String lower, String email) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        if (tasks.isEmpty()) {
            return conversationService.saveConversation(prompt, "You don't have any tasks to update.", email);
        }

        LocalDateTime newDueDate = extractDueDate(prompt);
        Priority newPriority = extractPriority(lower);

        if (newDueDate == null && newPriority == null) {
            return conversationService.saveConversation(prompt,
                "What would you like to change?\nExamples:\n- Update all tasks to tomorrow\n- Update all tasks priority to high\n- Update all tasks to next Monday", email);
        }

        int count = 0;
        for (TaskResponse t : tasks) {
            try {
                TaskRequest req = new TaskRequest();
                req.setTitle(t.getTitle());
                req.setDescription(t.getDescription());
                req.setPriority(newPriority != null ? newPriority : t.getPriority());
                req.setDueDate(newDueDate != null ? newDueDate : t.getDueDate());
                req.setEstimatedTime(t.getEstimatedTime());
                taskService.updateTask(t.getId(), req, email);
                count++;
            } catch (Exception e) {
                log.error("Failed to update task {}: {}", t.getId(), e.getMessage());
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Updated ").append(count).append(" task(s)\n");
        if (newDueDate != null) sb.append("Due date -> ").append(newDueDate.format(DateTimeFormatter.ofPattern("MMM d, yyyy"))).append("\n");
        if (newPriority != null) sb.append("Priority -> ").append(newPriority).append("\n");
        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // CATEGORY HANDLING
    // =====================================================================

    private AiConversationResponse handleListCategories(String prompt, String email) {
        List<CategoryResponse> categories = categoryService.getUserCategories(email);
        if (categories.isEmpty()) return conversationService.saveConversation(prompt, "No categories yet. Want me to create one?", email);
        StringBuilder sb = new StringBuilder();
        sb.append("Your categories (").append(categories.size()).append("):\n\n");
        categories.forEach(c -> sb.append("  - ").append(c.getName()).append(" (").append(c.getColor() != null ? c.getColor() : "#F97316").append(")\n"));
        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // TAG HANDLING
    // =====================================================================

    private AiConversationResponse handleListTags(String prompt, String email) {
        List<TagResponse> tags = tagService.getUserTags(email);
        if (tags.isEmpty()) return conversationService.saveConversation(prompt, "No tags yet. Want me to create one?", email);
        StringBuilder sb = new StringBuilder();
        sb.append("Your tags (").append(tags.size()).append("):\n\n");
        tags.forEach(t -> sb.append("  - ").append(t.getName()).append("\n"));
        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    private AiConversationResponse handleCreateTags(String prompt, String lower, String email) {
        // Check for count: "create 10 tags"
        Matcher countMatcher = Pattern.compile("(\\d+)\\s+(tags?)").matcher(lower);
        int count = 0;
        if (countMatcher.find()) {
            count = Math.min(Integer.parseInt(countMatcher.group(1)), 30);
        }

        // Single tag: "create tag called Work" or "add tag important"
        if (count == 0) {
            String name = extractTagName(prompt);
            if (name.isEmpty() || name.length() < 2) name = "New Tag";
            String color = extractColor(lower);
            try {
                TagRequest req = new TagRequest();
                req.setName(capitalizeFirst(name));
                req.setColor(color);
                TagResponse created = tagService.createTag(req, email);
                return conversationService.saveConversation(prompt, "Tag created: " + created.getName(), email);
            } catch (Exception e) {
                return conversationService.saveConversation(prompt, "Failed to create tag: " + e.getMessage(), email);
            }
        }

        // Multiple tags: "create 10 tags"
        // Check if user provided specific tag names after the pattern
        String afterPattern = prompt.replaceAll("(?i)^(create|add|make|new|please|can you|\\d+|tags?|tag|useful|important|nice|good|some)\\s*", "").trim();
        afterPattern = afterPattern.replaceAll("(?i)\\s*(please|tags?|for me|for my tasks)\\s*$", "").trim();

        List<String> tagNames = new ArrayList<>();

        if (afterPattern.length() > 2 && afterPattern.contains(",")) {
            // Comma-separated: "create tags: work, personal, health"
            tagNames = Arrays.stream(afterPattern.split(","))
                .map(s -> s.trim().replaceAll("^[:\\-]\\s*", ""))
                .filter(s -> s.length() > 1)
                .map(this::capitalizeFirst)
                .collect(Collectors.toList());
        } else if (afterPattern.length() > 2 && afterPattern.contains("|")) {
            tagNames = Arrays.stream(afterPattern.split("\\|"))
                .map(s -> s.trim().replaceAll("^[:\\-]\\s*", ""))
                .filter(s -> s.length() > 1)
                .map(this::capitalizeFirst)
                .collect(Collectors.toList());
        }

        // If no specific names, use Gemini to generate
        if (tagNames.isEmpty()) {
            String geminiPrompt = "Generate exactly " + count + " short tag names for a task management app.\n"
                + "User said: \"" + prompt + "\"\n"
                + "Rules:\n"
                + "- Each tag name: max 15 chars, single word or two words\n"
                + "- If user mentions a type (work, study, health), generate tags of that type\n"
                + "- Otherwise generate common useful tags\n"
                + "- Return ONLY tag names separated by ' | '\n"
                + "- Example: 'create 10 tags' -> Work | Personal | Health | Study | Urgent | Shopping | Finance | Home | Fitness | Creative";

            String response = ollamaClient.chat(geminiPrompt)
                .replaceAll("\\*\\*", "")
                .replaceAll("\\n", " ")
                .replaceAll("(?i)^(tags?|here\\s+(are|is)\\s+(the\\s+)?tags?)\\s*:?", "")
                .trim();

            tagNames = Arrays.stream(response.split("\\|"))
                .map(s -> s.trim().replaceAll("^[-*]\\s*", "").replaceAll("^\\d+\\.\\s*", ""))
                .filter(s -> s.length() > 1 && s.length() <= 20)
                .map(this::capitalizeFirst)
                .limit(count)
                .collect(Collectors.toList());
        }

        // Fallback if still empty
        if (tagNames.isEmpty()) {
            String[] defaults = {"Work", "Personal", "Health", "Study", "Urgent", "Shopping", "Finance", "Home", "Fitness", "Creative"};
            tagNames = Arrays.stream(defaults).limit(count).collect(Collectors.toList());
        }

        List<TagResponse> created = new ArrayList<>();
        for (String name : tagNames) {
            try {
                TagRequest req = new TagRequest();
                req.setName(name);
                req.setColor(extractColor(lower));
                created.add(tagService.createTag(req, email));
            } catch (Exception e) {
                log.warn("Failed to create tag {}: {}", name, e.getMessage());
            }
        }

        if (created.isEmpty()) {
            return conversationService.saveConversation(prompt, "Failed to create tags. They may already exist.", email);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Created ").append(created.size()).append(" tag(s):\n\n");
        created.forEach(t -> sb.append("  - ").append(t.getName()).append("\n"));
        if (created.size() < count) sb.append("\n(").append(count - created.size()).append(" skipped — may already exist)");
        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // ANALYZE
    // =====================================================================

    private AiConversationResponse handleAnalyze(String prompt, String email, String timezone) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        if (tasks.isEmpty()) return conversationService.saveConversation(prompt, "No tasks to analyze. Create some first!", email);

        LocalDateTime now = nowInTimezone(timezone);
        long total = tasks.size();
        long completed = tasks.stream().filter(t -> t.getStatus().toString().equals("COMPLETED")).count();
        long pending = tasks.stream().filter(t -> t.getStatus().toString().equals("PENDING")).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus().toString().equals("IN_PROGRESS")).count();
        long overdue = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) && !t.getStatus().toString().equals("COMPLETED")).count();
        double rate = total > 0 ? (completed * 100.0 / total) : 0;
        long urgentTasks = tasks.stream().filter(t -> t.getPriority() == Priority.URGENT && !t.getStatus().toString().equals("COMPLETED")).count();
        long highTasks = tasks.stream().filter(t -> t.getPriority() == Priority.HIGH && !t.getStatus().toString().equals("COMPLETED")).count();
        long dueToday = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().equals(now.toLocalDate()) && !t.getStatus().toString().equals("COMPLETED")).count();
        long dueTomorrow = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().toLocalDate().equals(now.plusDays(1).toLocalDate()) && !t.getStatus().toString().equals("COMPLETED")).count();

        Map<String, Long> catBreakdown = tasks.stream()
            .filter(t -> t.getCategoryName() != null)
            .collect(Collectors.groupingBy(TaskResponse::getCategoryName, Collectors.counting()));

        Map<String, Long> priorityBreakdown = tasks.stream()
            .filter(t -> !t.getStatus().toString().equals("COMPLETED"))
            .collect(Collectors.groupingBy(t -> t.getPriority().toString(), Collectors.counting()));

        StringBuilder sb = new StringBuilder();
        sb.append("📊 Productivity Report\n").append("=".repeat(30)).append("\n\n");
        sb.append("Total Tasks: ").append(total).append("\n");
        sb.append("Completed: ").append(completed).append(" (").append(String.format("%.0f", rate)).append("%)\n");
        sb.append("Pending: ").append(pending).append(" | In Progress: ").append(inProgress).append("\n");

        if (overdue > 0) sb.append("⚠️ Overdue: ").append(overdue).append(" — needs immediate attention!\n");
        if (dueToday > 0) sb.append("📅 Due Today: ").append(dueToday).append("\n");
        if (dueTomorrow > 0) sb.append("📆 Due Tomorrow: ").append(dueTomorrow).append("\n");
        if (urgentTasks > 0) sb.append("🔴 Urgent: ").append(urgentTasks).append("\n");
        if (highTasks > 0) sb.append("🟠 High Priority: ").append(highTasks).append("\n");

        if (!priorityBreakdown.isEmpty()) {
            sb.append("\nBy Priority:\n");
            priorityBreakdown.forEach((p, c) -> sb.append("  ").append(p).append(": ").append(c).append(" tasks\n"));
        }

        if (!catBreakdown.isEmpty()) {
            sb.append("\nBy Category:\n");
            catBreakdown.forEach((cat, count) -> sb.append("  ").append(cat).append(": ").append(count).append(" tasks\n"));
        }

        // Smart recommendations
        sb.append("\n💡 Insights:\n");
        if (overdue > 0) {
            sb.append("  - You have ").append(overdue).append(" overdue task(s). Focus on these first!\n");
        }
        if (rate >= 80) {
            sb.append("  - Excellent completion rate! Keep it up!\n");
        } else if (rate >= 50) {
            sb.append("  - Good progress! Try to complete ").append(pending / 2).append(" more tasks today.\n");
        } else if (pending > 5) {
            sb.append("  - You have ").append(pending).append(" pending tasks. Try breaking them into smaller pieces.\n");
        } else {
            sb.append("  - You're doing well! Stay focused on your priorities.\n");
        }

        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // CHAT — Gemini for conversational responses
    // =====================================================================

    // =====================================================================
    // SUBJECTS DATABASE
    // =====================================================================

    private static final Map<String, Map<String, List<String>>> SUBJECTS_DB = new HashMap<>();

    static {
        // CSE Subjects by Semester
        Map<String, List<String>> cseSubjects = new HashMap<>();
        cseSubjects.put("1", List.of(
            "Engineering Mathematics - I", "Engineering Physics", "Basic Electrical Engineering",
            "Engineering Chemistry", "Workshop Practice", "Communication Skills"
        ));
        cseSubjects.put("2", List.of(
            "Engineering Mathematics - II", "Engineering Physics - II", "Basic Electronics",
            "Environmental Science", "Programming in C", "Engineering Graphics"
        ));
        cseSubjects.put("3", List.of(
            "Discrete Mathematics", "Data Structures", "Digital Logic Design",
            "Object Oriented Programming (Java)", "Computer Organization & Architecture", "Technical Communication"
        ));
        cseSubjects.put("4", List.of(
            "Mathematics - III (Probability & Statistics)", "Algorithm Analysis & Design",
            "Operating Systems", "Database Management Systems", "Theory of Computation", "Microprocessor & Interfacing"
        ));
        cseSubjects.put("5", List.of(
            "Computer Networks", "Software Engineering", "Compiler Design",
            "Web Technologies", "Artificial Intelligence", "Cryptography & Network Security"
        ));
        cseSubjects.put("6", List.of(
            "Machine Learning", "Cloud Computing", "Internet of Things (IoT)",
            "Information Retrieval", "Parallel Computing", "Blockchain Technology"
        ));
        cseSubjects.put("7", List.of(
            "Deep Learning", "Big Data Analytics", "DevOps & Cloud Infrastructure",
            "Mobile App Development", "Quantum Computing", "Research Methodology"
        ));
        cseSubjects.put("8", List.of(
            "Major Project", "Technical Seminar", "Industrial Training",
            "Elective - I", "Elective - II", "Comprehensive Viva"
        ));
        SUBJECTS_DB.put("CSE", cseSubjects);
        SUBJECTS_DB.put("Computer Science & Engineering", cseSubjects);
        SUBJECTS_DB.put("Information Technology", cseSubjects);

        // IT Subjects (similar to CSE with some differences)
        Map<String, List<String>> itSubjects = new HashMap<>(cseSubjects);
        itSubjects.put("5", List.of(
            "Computer Networks", "Software Engineering", "Web Engineering",
            "Information Security", "Artificial Intelligence", "Digital Image Processing"
        ));
        SUBJECTS_DB.put("IT", itSubjects);

        // ECE Subjects
        Map<String, List<String>> eceSubjects = new HashMap<>();
        eceSubjects.put("7", List.of(
            "VLSI Design", "Embedded Systems", "Wireless Communication",
            "Signal Processing", "Microwave Engineering", "Optical Communication"
        ));
        SUBJECTS_DB.put("ECE", eceSubjects);
        SUBJECTS_DB.put("Electronics & Communication", eceSubjects);

        // ME Subjects
        Map<String, List<String>> meSubjects = new HashMap<>();
        meSubjects.put("7", List.of(
            "Automobile Engineering", "Robotics", "CAD/CAM",
            "Finite Element Analysis", "Computational Fluid Dynamics", "Industrial Engineering"
        ));
        SUBJECTS_DB.put("ME", meSubjects);
        SUBJECTS_DB.put("Mechanical Engineering", meSubjects);

        // CE Subjects
        Map<String, List<String>> ceSubjects = new HashMap<>();
        ceSubjects.put("7", List.of(
            "Structural Analysis - II", "Geotechnical Engineering", "Transportation Engineering",
            "Environmental Engineering", "Surveying - II", "Quantity Surveying"
        ));
        SUBJECTS_DB.put("CE", ceSubjects);
        SUBJECTS_DB.put("Civil Engineering", ceSubjects);
    }

    private List<String> getSubjectsForProfile(String profileContext) {
        if (profileContext == null || profileContext.isEmpty()) return List.of();

        String stream = "";
        String semester = "";

        // Parse stream from profile
        Matcher streamMatcher = Pattern.compile("(?i)Stream:\\s*([^;]+)").matcher(profileContext);
        if (streamMatcher.find()) stream = streamMatcher.group(1).trim();

        // Parse semester from profile
        Matcher semMatcher = Pattern.compile("(?i)Semester:\\s*(\\d+)").matcher(profileContext);
        if (semMatcher.find()) semester = semMatcher.group(1).trim();

        if (stream.isEmpty() || semester.isEmpty()) return List.of();

        // Find matching stream
        for (Map.Entry<String, Map<String, List<String>>> entry : SUBJECTS_DB.entrySet()) {
            if (stream.toLowerCase().contains(entry.getKey().toLowerCase())
                || entry.getKey().toLowerCase().contains(stream.toLowerCase())) {
                Map<String, List<String>> semMap = entry.getValue();
                return semMap.getOrDefault(semester, List.of());
            }
        }

        return List.of();
    }

    private boolean isAskingSubjects(String lower) {
        return containsAny(lower, "what are my subjects", "my subjects", "subject list",
            "which subjects", "tell me my subjects", "what subjects", "list subjects",
            "show subjects", "what do i study", "what should i study",
            "syllabus", "what courses", "my course subjects");
    }

    private AiConversationResponse handleSubjectsQuery(String prompt, String email, String profileContext) {
        List<String> subjects = getSubjectsForProfile(profileContext);

        // Extract stream and semester from profile
        String stream = "";
        String semester = "";
        Matcher streamMatcher = Pattern.compile("(?i)Stream:\\s*([^;]+)").matcher(profileContext != null ? profileContext : "");
        if (streamMatcher.find()) stream = streamMatcher.group(1).trim();
        Matcher semMatcher = Pattern.compile("(?i)Semester:\\s*(\\d+)").matcher(profileContext != null ? profileContext : "");
        if (semMatcher.find()) semester = semMatcher.group(1).trim();

        StringBuilder sb = new StringBuilder();

        if (stream.isEmpty() || semester.isEmpty()) {
            sb.append("Please set your academic profile first!\n\n");
            sb.append("Click the **Profile** button in the topbar and set:\n");
            sb.append("- University\n");
            sb.append("- Course (e.g., B.Tech)\n");
            sb.append("- Stream (e.g., Computer Science & Engineering)\n");
            sb.append("- Semester\n\n");
            sb.append("Then I can tell you your exact subjects!");
        } else if (subjects.isEmpty()) {
            sb.append("I don't have subject data for **").append(stream).append("** semester **").append(semester).append("** yet.\n\n");
            sb.append("Your profile:\n");
            sb.append("- Stream: ").append(stream).append("\n");
            sb.append("- Semester: ").append(semester).append("\n\n");
            sb.append("I currently have data for: CSE, IT, ECE, ME, CE (semesters 1-8)");
        } else {
            sb.append("**Your Subjects - Semester ").append(semester).append("**\n");
            sb.append("**Stream:** ").append(stream).append("\n\n");
            for (int i = 0; i < subjects.size(); i++) {
                sb.append(i + 1).append(". ").append(subjects.get(i)).append("\n");
            }
            sb.append("\n---\n");
            sb.append("Say **\"create tasks for [subject]\"** and I'll generate study tasks for any subject!");
        }

        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // PROFILE INFO QUERIES
    // =====================================================================

    private boolean isAskingProfileInfo(String lower) {
        return containsAny(lower, "my university", "my college", "my course", "my stream",
            "my semester", "my year", "university name", "college name", "which university",
            "which college", "what is my profile", "my profile", "tell me about me",
            "what do you know about me", "what is my course", "what is my stream");
    }

    private AiConversationResponse handleProfileInfoQuery(String prompt, String email, String profileContext) {
        String university = "";
        String course = "";
        String stream = "";
        String semester = "";
        String year = "";

        if (profileContext != null && !profileContext.isEmpty()) {
            Matcher u = Pattern.compile("(?i)University:\\s*([^;]+)").matcher(profileContext);
            if (u.find()) university = u.group(1).trim();
            Matcher c = Pattern.compile("(?i)Course:\\s*([^;]+)").matcher(profileContext);
            if (c.find()) course = c.group(1).trim();
            Matcher s = Pattern.compile("(?i)Stream:\\s*([^;]+)").matcher(profileContext);
            if (s.find()) stream = s.group(1).trim();
            Matcher sem = Pattern.compile("(?i)Semester:\\s*(\\d+)").matcher(profileContext);
            if (sem.find()) semester = sem.group(1).trim();
            Matcher y = Pattern.compile("(?i)Year:\\s*([^;]+)").matcher(profileContext);
            if (y.find()) year = y.group(1).trim();
        }

        String lower = prompt.toLowerCase().trim();

        // Specific questions
        if (lower.contains("university") || lower.contains("college")) {
            if (!university.isEmpty()) {
                return conversationService.saveConversation(prompt, "You're studying at **" + university + "**! 🎓", email);
            }
            return conversationService.saveConversation(prompt, "You haven't set your university yet. Click the **Profile** button in the topbar to add it!", email);
        }
        if (lower.contains("course")) {
            if (!course.isEmpty()) {
                return conversationService.saveConversation(prompt, "You're pursuing **" + course + "**" + (!stream.isEmpty() ? " in **" + stream + "**" : "") + "! 📚", email);
            }
            return conversationService.saveConversation(prompt, "You haven't set your course yet. Click the **Profile** button in the topbar to add it!", email);
        }
        if (lower.contains("stream")) {
            if (!stream.isEmpty()) {
                return conversationService.saveConversation(prompt, "Your stream is **" + stream + "**! 💻", email);
            }
            return conversationService.saveConversation(prompt, "You haven't set your stream yet. Click the **Profile** button in the topbar to add it!", email);
        }
        if (lower.contains("semester")) {
            if (!semester.isEmpty()) {
                return conversationService.saveConversation(prompt, "You're in **Semester " + semester + "**! 📅", email);
            }
            return conversationService.saveConversation(prompt, "You haven't set your semester yet. Click the **Profile** button in the topbar to add it!", email);
        }

        // General profile
        if (!university.isEmpty() || !course.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("Here's what I know about you:\n\n");
            if (!university.isEmpty()) sb.append("**University:** ").append(university).append("\n");
            if (!course.isEmpty()) sb.append("**Course:** ").append(course).append("\n");
            if (!stream.isEmpty()) sb.append("**Stream:** ").append(stream).append("\n");
            if (!semester.isEmpty()) sb.append("**Semester:** ").append(semester).append("\n");
            if (!year.isEmpty()) sb.append("**Year:** ").append(year).append("\n");
            sb.append("\nWant me to create study tasks for any subject? Just ask!");
            return conversationService.saveConversation(prompt, sb.toString(), email);
        }

        return conversationService.saveConversation(prompt, "I don't have your profile details yet! Click the **Profile** button in the topbar to set your university, course, stream, and semester. Then I can help you better!", email);
    }

    // =====================================================================
    // CASUAL / NATURAL CONVERSATION
    // =====================================================================

    private boolean isCasualConversation(String lower) {
        return lower.matches("(hi|hello|hey|howdy|sup|yo|namaste|good\\s*(morning|afternoon|evening|night))")
            || lower.matches("(how are you|how r u|how's it going|what's up|whats up|kaise ho|kya hal)")
            || lower.matches("(thanks|thank you|thx|shukriya|dhanyavaad)")
            || lower.matches("(bye|goodbye|see you|good night|gn|tc|take care)")
            || lower.matches("(who are you|what are you|your name|whats your name|what's your name|tumhara naam)")
            || lower.matches("(what can you do|help me|what do you do|your features)")
            || lower.matches("(yes|no|ok|okay|sure|alright|fine|cool|nice|great|awesome|perfect)")
            || lower.contains("tell me a joke") || lower.contains("joke sunao")
            || lower.contains("motivate") || lower.contains("inspire");
    }

    private AiConversationResponse handleCasualChat(String prompt, String email, String timezone, String weatherContext, String profileContext) {
        String lower = prompt.toLowerCase().trim();
        LocalDateTime userNow = nowInTimezone(timezone);
        String timeOfDay = "morning";
        int hour = userNow.getHour();
        if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
        else if (hour >= 17) timeOfDay = "evening";

        // Greetings
        if (lower.matches("(hi|hello|hey|howdy|sup|yo|namaste).*")) {
            String name = "";
            try {
                var user = userRepository.findByEmail(email).orElse(null);
                if (user != null && user.getName() != null) name = user.getName().split(" ")[0];
            } catch (Exception e) { /* ignore */ }

            StringBuilder sb = new StringBuilder();
            sb.append("Hey").append(name.isEmpty() ? "" : " " + name).append("! 👋 Good ").append(timeOfDay).append("!\n\n");

            if (!profileContext.isEmpty()) {
                String stream = "";
                Matcher s = Pattern.compile("(?i)Stream:\\s*([^;]+)").matcher(profileContext);
                if (s.find()) stream = s.group(1).trim();
                if (!stream.isEmpty()) {
                    sb.append("Ready to ace your **").append(stream).append("** studies today?\n\n");
                }
            }

            // Quick task overview
            try {
                List<TaskResponse> tasks = taskService.getUserTasks(email);
                long pending = tasks.stream().filter(t -> !t.getStatus().toString().equals("COMPLETED")).count();
                long overdue = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(userNow) && !t.getStatus().toString().equals("COMPLETED")).count();
                if (overdue > 0) {
                    sb.append("⚠️ You have **").append(overdue).append("** overdue task").append(overdue > 1 ? "s" : "").append(" — let's fix that!\n");
                } else if (pending > 0) {
                    sb.append("You have **").append(pending).append("** task").append(pending > 1 ? "s" : "").append(" pending. You got this! 💪\n");
                } else {
                    sb.append("All tasks completed! 🎉 You're on fire!\n");
                }
            } catch (Exception e) { /* ignore */ }

            sb.append("\nWhat would you like to do? I can help you with tasks, notes, or just chat!");
            return conversationService.saveConversation(prompt, sb.toString(), email);
        }

        // How are you
        if (lower.matches("(how are you|how r u|how's it going|what's up|whats up|kaise ho|kya hal).*")) {
            return conversationService.saveConversation(prompt,
                "I'm doing great, thanks for asking! 😊 I'm your SmartTask24 assistant — always ready to help you stay productive.\n\n"
                + "How about you? Need help with tasks, want to create notes, or just want to chat?", email);
        }

        // Who are you / your name
        if (lower.matches("(who are you|what are you|your name|whats your name|what's your name|tumhara naam).*")) {
            return conversationService.saveConversation(prompt,
                "I'm **SmartTask24 AI** — your personal productivity assistant powered by Gemini! 🤖\n\n"
                + "I can help you with:\n"
                + "- Creating and managing tasks\n"
                + "- Taking notes with diagrams\n"
                + "- Planning your day\n"
                + "- Tracking your study progress\n"
                + "- And just having a friendly chat!\n\n"
                + "What can I help you with?", email);
        }

        // What can you do
        if (lower.matches("(what can you do|help me|what do you do|your features).*")) {
            return conversationService.saveConversation(prompt,
                "Here's what I can do for you:\n\n"
                + "**📋 Tasks:** Create, complete, delete, update tasks. I understand natural language like \"create 10 studying tasks from 9am to 12am\"\n\n"
                + "**📝 Notes:** Create notes with diagrams. I auto-fetch images from Wikipedia!\n\n"
                + "**📅 Plan:** Say \"plan my day\" and I'll create a time-blocked schedule\n\n"
                + "**📊 Analytics:** Ask \"analyze my productivity\" for insights\n\n"
                + "**🎓 Academics:** Set your profile and I'll know your subjects, generate subject-specific tasks\n\n"
                + "**💬 Chat:** Just talk to me! I'm friendly 😊\n\n"
                + "What would you like to try?", email);
        }

        // Thanks
        if (lower.matches("(thanks|thank you|thx|shukriya|dhanyavaad).*")) {
            return conversationService.saveConversation(prompt,
                "You're welcome! 😊 Always happy to help. Let me know if you need anything else!", email);
        }

        // Bye
        if (lower.matches("(bye|goodbye|see you|good night|gn|tc|take care).*")) {
            return conversationService.saveConversation(prompt,
                "Goodbye! 👋 Keep up the great work with your studies. See you next time!", email);
        }

        // Joke
        if (lower.contains("joke")) {
            String[] jokes = {
                "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😂",
                "Why was the computer cold? It left its Windows open! 🪟😄",
                "What's a computer's favorite snack? Microchips! 🍟",
                "Why did the developer go broke? Because he used up all his cache! 💸",
                "Why do Java developers wear glasses? Because they can't C#! 👓"
            };
            String joke = jokes[new Random().nextInt(jokes.length)];
            return conversationService.saveConversation(prompt, joke + "\n\nWant another one or need help with tasks? 😄", email);
        }

        // Motivation
        if (lower.contains("motivate") || lower.contains("inspire")) {
            String[] quotes = {
                "\"The only way to do great work is to love what you do.\" — Steve Jobs",
                "\"Success is not final, failure is not fatal: it is the courage to continue that counts.\" — Winston Churchill",
                "\"Don't watch the clock; do what it does. Keep going.\" — Sam Levenson",
                "\"The future belongs to those who believe in the beauty of their dreams.\" — Eleanor Roosevelt",
                "\"It always seems impossible until it's done.\" — Nelson Mandela"
            };
            String quote = quotes[new Random().nextInt(quotes.length)];
            return conversationService.saveConversation(prompt,
                "Here's some motivation for you! 💪\n\n" + quote + "\n\n"
                + "You're doing amazing with your studies. Keep pushing forward! What task should we tackle next?", email);
        }

        // Default casual
        return conversationService.saveConversation(prompt,
            "Hey! I'm here to help. You can ask me to:\n"
            + "- Create tasks or notes\n"
            + "- Plan your day\n"
            + "- Check your subjects\n"
            + "- Or just chat!\n\n"
            + "What would you like to do?", email);
    }

    // =====================================================================
    // CHAT
    // =====================================================================

    private AiConversationResponse handleChat(String prompt, String email, String timezone, String weatherContext, String profileContext) {
        LocalDateTime userNow = nowInTimezone(timezone);
        String taskContext = buildRichTaskContext(email, timezone);
        String overdueContext = buildOverdueContext(email, timezone);
        String memoryContext = buildConversationMemory(email);
        String now = userNow.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a"));
        String profileInfo = profileContext != null && !profileContext.isEmpty() ? "\nUser's academic profile: " + profileContext + "\n" : "";

        String lower = prompt.toLowerCase().trim();
        boolean isGreeting = lower.matches("(hi|hello|hey|good\\s*(morning|afternoon|evening)|namaste|sup|yo|howdy|greetings).*");

        log.info("handleChat - timezone: {}, userNow: {}, weather: [{}], isGreeting: {}", timezone, now, weatherContext, isGreeting);

        // Pre-build weather greeting in Java (don't trust Gemini to include it)
        String weatherGreeting = "";
        if (isGreeting && weatherContext != null && !weatherContext.isEmpty()) {
            String[] parts = weatherContext.split("\\|\\|\\|");
            String temp = parts.length > 0 ? parts[0].trim() : "";
            String condition = parts.length > 1 ? parts[1].trim() : "";
            String city = parts.length > 2 ? parts[2].trim() : "";

            String emoji = "🌤️";
            if (!condition.isEmpty()) {
                String condLower = condition.toLowerCase();
                if (condLower.contains("sunny") || condLower.contains("clear")) emoji = "☀️";
                else if (condLower.contains("cloud") || condLower.contains("overcast")) emoji = "☁️";
                else if (condLower.contains("rain") || condLower.contains("drizzle")) emoji = "🌧️";
                else if (condLower.contains("thunder") || condLower.contains("storm")) emoji = "⛈️";
                else if (condLower.contains("snow")) emoji = "🌨️";
                else if (condLower.contains("fog") || condLower.contains("mist") || condLower.contains("haze")) emoji = "🌫️";
            }

            String timeOfDay = "morning";
            int hour = userNow.getHour();
            if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
            else if (hour >= 17) timeOfDay = "evening";

            StringBuilder greeting = new StringBuilder();
            greeting.append(emoji).append(" Good ").append(timeOfDay).append("!\n");

            if (!temp.isEmpty() || !condition.isEmpty() || !city.isEmpty()) {
                greeting.append("Welcome back. It's ");
                if (!temp.isEmpty()) greeting.append(temp).append("°C");
                if (!condition.isEmpty() && !temp.isEmpty()) greeting.append(" with ").append(condition);
                else if (!condition.isEmpty()) greeting.append(condition);
                if (!city.isEmpty()) greeting.append(" in ").append(city);
                greeting.append(".\n\n");
            } else {
                greeting.append("Welcome back!\n\n");
            }

            greeting.append("Here's your productivity overview:\n\n");
            greeting.append(taskContext).append("\n");
            greeting.append(overdueContext);

            log.info("Weather greeting built: {}", greeting);
            return conversationService.saveConversation(prompt, greeting.toString(), email);

        } else if (isGreeting) {
            String timeOfDay = "morning";
            int hour = userNow.getHour();
            if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
            else if (hour >= 17) timeOfDay = "evening";

            StringBuilder greeting = new StringBuilder();
            greeting.append("Good ").append(timeOfDay).append("!\n\n");
            greeting.append("Here's your productivity overview:\n\n");
            greeting.append(taskContext).append("\n");
            greeting.append(overdueContext);

            return conversationService.saveConversation(prompt, greeting.toString(), email);
        }

        // Non-greeting: use Gemini for chat
        String fullPrompt = "You are SmartTask24 AI — a friendly, helpful task management assistant. Current date/time: " + now + "\n"
            + profileInfo
            + "\nUser's tasks:\n" + taskContext + "\n"
            + overdueContext + "\n"
            + "Recent conversation:\n" + memoryContext + "\n\n"
            + "The user said: \"" + prompt + "\"\n\n"
            + "INSTRUCTIONS:\n"
            + "- Be NATURAL and CONVERSATIONAL — like a real friend, not a robot\n"
            + "- If they ask a question, answer it directly and helpfully\n"
            + "- If they want to chat, chat with them naturally\n"
            + "- Only mention tasks/deadlines if it's RELEVANT to the conversation\n"
            + "- Don't always start with task updates — read the room!\n"
            + "- Be warm, friendly, and use emojis naturally\n"
            + "- If they ask about themselves, use their profile info\n"
            + "- If they seem stressed, be supportive and encouraging\n"
            + "- If they're just chatting, chat back naturally\n"
            + "- Keep responses concise but warm (2-4 sentences)\n"
            + "- ALWAYS respond in English\n"
            + "- If user writes in Hindi/Hinglish, respond in English\n"
            + "- Be like a helpful study buddy, not a task manager\n";

        String response = ollamaClient.chat(fullPrompt);
        return conversationService.saveConversation(prompt, response, email);
    }

    private String buildOverdueContext(String email, String timezone) {
        StringBuilder ctx = new StringBuilder();
        try {
            List<TaskResponse> tasks = taskService.getUserTasks(email);
            LocalDateTime now = nowInTimezone(timezone);
            LocalDateTime endOfDay = now.toLocalDate().atTime(23, 59);
            LocalDateTime endOfTomorrow = now.plusDays(1).toLocalDate().atTime(23, 59);
            LocalDateTime endOfWeek = now.plusDays(7).toLocalDate().atTime(23, 59);

            List<TaskResponse> overdue = tasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now)
                    && !t.getStatus().toString().equals("COMPLETED")
                    && !t.getStatus().toString().equals("ARCHIVED"))
                .toList();

            List<TaskResponse> dueToday = tasks.stream()
                .filter(t -> t.getDueDate() != null
                    && !t.getDueDate().isBefore(now)
                    && t.getDueDate().isBefore(endOfDay)
                    && !t.getStatus().toString().equals("COMPLETED")
                    && !t.getStatus().toString().equals("ARCHIVED"))
                .toList();

            List<TaskResponse> dueTomorrow = tasks.stream()
                .filter(t -> t.getDueDate() != null
                    && !t.getDueDate().isBefore(now.plusDays(1).toLocalDate().atStartOfDay())
                    && t.getDueDate().isBefore(endOfTomorrow)
                    && !t.getStatus().toString().equals("COMPLETED")
                    && !t.getStatus().toString().equals("ARCHIVED"))
                .toList();

            List<TaskResponse> dueThisWeek = tasks.stream()
                .filter(t -> t.getDueDate() != null
                    && t.getDueDate().isAfter(endOfTomorrow)
                    && t.getDueDate().isBefore(endOfWeek)
                    && !t.getStatus().toString().equals("COMPLETED")
                    && !t.getStatus().toString().equals("ARCHIVED"))
                .toList();

            if (!overdue.isEmpty()) {
                ctx.append("\n🚨🚨🚨 CRITICAL: ").append(overdue.size()).append(" OVERDUE TASK(s) — NEED IMMEDIATE ACTION! 🚨🚨🚨\n");
                overdue.forEach(t -> {
                    long hoursOverdue = java.time.Duration.between(t.getDueDate(), now).toHours();
                    long daysOverdue = java.time.Duration.between(t.getDueDate(), now).toDays();
                    if (daysOverdue > 0) {
                        ctx.append("  - ").append(t.getTitle())
                           .append(" (").append(t.getPriority()).append(")")
                           .append(" — was due ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, h:mm a")))
                           .append(" — ").append(daysOverdue).append(" day").append(daysOverdue > 1 ? "s" : "").append(" OVERDUE!\n");
                    } else {
                        ctx.append("  - ").append(t.getTitle())
                           .append(" (").append(t.getPriority()).append(")")
                           .append(" — was due ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, h:mm a")))
                           .append(" — ").append(hoursOverdue).append(" hour").append(hoursOverdue > 1 ? "s" : "").append(" OVERDUE!\n");
                    }
                });
            }

            if (!dueToday.isEmpty()) {
                ctx.append("\n⏰⏰⏰ URGENT: ").append(dueToday.size()).append(" task(s) DUE TODAY! ⏰⏰⏰\n");
                dueToday.forEach(t -> {
                    long hoursLeft = java.time.Duration.between(now, t.getDueDate()).toHours();
                    ctx.append("  - ").append(t.getTitle())
                       .append(" (").append(t.getPriority()).append(")")
                       .append(" — due at ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("h:mm a")));
                    if (hoursLeft <= 2) ctx.append(" — ⚠️ LESS THAN 2 HOURS LEFT!");
                    else if (hoursLeft <= 6) ctx.append(" — ⚠️ FEW HOURS LEFT");
                    ctx.append("\n");
                });
            }

            if (!dueTomorrow.isEmpty()) {
                ctx.append("\n🔔 ATTENTION: ").append(dueTomorrow.size()).append(" task(s) DUE TOMORROW!\n");
                dueTomorrow.forEach(t -> ctx.append("  - ").append(t.getTitle())
                    .append(" (").append(t.getPriority()).append(")")
                    .append(" — due ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("h:mm a"))).append("\n"));
            }

            if (!dueThisWeek.isEmpty()) {
                ctx.append("\n📅 UPCOMING THIS WEEK: ").append(dueThisWeek.size()).append(" task(s)\n");
                dueThisWeek.stream().limit(5).forEach(t -> {
                    long daysUntil = java.time.Duration.between(now, t.getDueDate()).toDays();
                    ctx.append("  - ").append(t.getTitle())
                       .append(" (").append(t.getPriority()).append(")")
                       .append(" — due ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("EEE, MMM d")))
                       .append(" (").append(daysUntil).append(" day").append(daysUntil > 1 ? "s" : "").append(")\n");
                });
            }

            long urgentCount = tasks.stream()
                .filter(t -> t.getPriority() == Priority.URGENT
                    && !t.getStatus().toString().equals("COMPLETED"))
                .count();
            if (urgentCount > 0) {
                ctx.append("\n🔴 URGENT TASKS: ").append(urgentCount).append(" need attention\n");
            }
        } catch (Exception e) {
            log.warn("Could not build overdue context", e);
        }
        return ctx.toString();
    }

    private String buildRichTaskContext(String email, String timezone) {
        StringBuilder ctx = new StringBuilder();
        try {
            List<TaskResponse> tasks = taskService.getUserTasks(email);
            if (tasks.isEmpty()) {
                ctx.append("(No tasks yet)\n");
                return ctx.toString();
            }

            LocalDateTime now = nowInTimezone(timezone);
            long pending = tasks.stream().filter(t -> t.getStatus().toString().equals("PENDING")).count();
            long completed = tasks.stream().filter(t -> t.getStatus().toString().equals("COMPLETED")).count();
            long overdue = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) && !t.getStatus().toString().equals("COMPLETED")).count();

            ctx.append("Total: ").append(tasks.size())
               .append(" | Pending: ").append(pending)
               .append(" | Done: ").append(completed);
            if (overdue > 0) ctx.append(" | ⚠️ Overdue: ").append(overdue);
            ctx.append("\n\n");

            List<TaskResponse> active = tasks.stream()
                .filter(t -> !t.getStatus().toString().equals("COMPLETED") && !t.getStatus().toString().equals("ARCHIVED"))
                .limit(15).toList();

            ctx.append("Active tasks:\n");
            active.forEach(t -> {
                ctx.append("  - ").append(t.getTitle())
                   .append(" (").append(t.getPriority()).append(")");
                if (t.getDueDate() != null) {
                    boolean isOverdue = t.getDueDate().isBefore(now);
                    ctx.append(" | Due: ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, h:mm a")));
                    if (isOverdue) {
                        long hours = java.time.Duration.between(t.getDueDate(), now).toHours();
                        long days = java.time.Duration.between(t.getDueDate(), now).toDays();
                        if (days > 0) ctx.append(" ⚠️ OVERDUE (").append(days).append("d)");
                        else ctx.append(" ⚠️ OVERDUE (").append(hours).append("h)");
                    } else if (t.getDueDate().toLocalDate().equals(now.toLocalDate())) {
                        long hoursLeft = java.time.Duration.between(now, t.getDueDate()).toHours();
                        ctx.append(" 📅 TODAY");
                        if (hoursLeft <= 2) ctx.append(" — ⚠️ LESS THAN 2 HOURS!");
                        else ctx.append(" — ").append(hoursLeft).append("h left");
                    } else if (t.getDueDate().toLocalDate().equals(now.plusDays(1).toLocalDate())) {
                        ctx.append(" 📆 TOMORROW");
                    } else {
                        long daysUntil = java.time.Duration.between(now, t.getDueDate()).toDays();
                        if (daysUntil <= 7) ctx.append(" (").append(daysUntil).append("d)");
                    }
                }
                ctx.append("\n");
            });

            List<TaskResponse> done = tasks.stream()
                .filter(t -> t.getStatus().toString().equals("COMPLETED"))
                .limit(5).toList();
            if (!done.isEmpty()) {
                ctx.append("\nRecently completed:\n");
                done.forEach(t -> ctx.append("  done ").append(t.getTitle()).append("\n"));
            }
        } catch (Exception e) {
            ctx.append("(Could not load task data)\n");
        }
        return ctx.toString();
    }

    private String buildConversationMemory(String email) {
        try {
            List<AiConversationResponse> recent = conversationService.getRecentConversations(email, CONVERSATION_MEMORY_SIZE);
            if (recent.isEmpty()) return "(No previous conversation)";
            List<AiConversationResponse> chronological = new ArrayList<>(recent);
            Collections.reverse(chronological);
            StringBuilder sb = new StringBuilder();
            chronological.forEach(c -> {
                String shortPrompt = c.getPrompt().length() > 60 ? c.getPrompt().substring(0, 60) + "..." : c.getPrompt();
                String shortResponse = c.getResponse().length() > 60 ? c.getResponse().substring(0, 60) + "..." : c.getResponse();
                sb.append("User: ").append(shortPrompt).append("\nAI: ").append(shortResponse).append("\n\n");
            });
            return sb.toString();
        } catch (Exception e) {
            return "(No conversation history)";
        }
    }

    // =====================================================================
    // PLAN MY DAY
    // =====================================================================

    private AiConversationResponse handlePlanMyDay(String prompt, String email, String timezone, String weatherContext, String profileContext) {
        LocalDateTime userNow = nowInTimezone(timezone);
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        List<TaskResponse> pending = tasks.stream()
            .filter(t -> !t.getStatus().toString().equals("COMPLETED") && !t.getStatus().toString().equals("ARCHIVED"))
            .sorted(Comparator.comparing(t -> t.getDueDate() != null ? t.getDueDate() : LocalDateTime.MAX))
            .toList();

        String profileInfo = profileContext != null && !profileContext.isEmpty() ? "User profile: " + profileContext + "\n" : "";

        if (pending.isEmpty()) {
            return conversationService.saveConversation(prompt,
                "You have no pending tasks. Let me create a productive day plan for you!\n\n"
                + profileInfo
                + "Say: \"create 10 tasks from 9am to 12am\" and I'll build your daily routine.", email);
        }

        // Use Gemini to create a smart day plan
        String taskList = pending.stream().limit(20).map(t ->
            t.getTitle() + " (" + t.getPriority() + ")"
            + (t.getDueDate() != null ? " due " + t.getDueDate().format(DateTimeFormatter.ofPattern("h:mm a")) : "")
        ).collect(Collectors.joining("\n  - "));

        String weatherInfo = weatherContext != null && !weatherContext.isEmpty() ? "Weather: " + weatherContext + "\n" : "";

        String geminiPrompt = "You are SmartTask24 AI planner. Create an optimized day plan.\n\n"
            + profileInfo
            + "Current time: " + userNow.format(DateTimeFormatter.ofPattern("h:mm a, EEEE, MMMM d")) + "\n"
            + weatherInfo
            + "User's pending tasks:\n  - " + taskList + "\n\n"
            + "INSTRUCTIONS:\n"
            + "- Create a time-blocked schedule from now until end of day\n"
            + "- Put URGENT and HIGH priority tasks in the morning\n"
            + "- Add breaks between tasks (10-15 min)\n"
            + "- Include lunch break around 12-1 PM\n"
            + "- Add 'Wrap up & review' at end of day\n"
            + "- Be specific with times (e.g. '10:00 - 11:00: Task name')\n"
            + "- If user is a student, include study sessions, revision, and practice time\n"
            + "- Add motivational tone\n"
            + "- Keep it concise but actionable\n"
            + "- ALWAYS respond in English\n";

        String plan = ollamaClient.chat(geminiPrompt);

        StringBuilder sb = new StringBuilder();
        sb.append("📋 YOUR DAY PLAN\n");
        sb.append(userNow.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, h:mm a"))).append("\n");
        if (!weatherContext.isEmpty()) sb.append("Weather: ").append(weatherContext).append("\n");
        if (!profileContext.isEmpty()) sb.append(profileContext).append("\n");
        sb.append("\n").append(plan);
        sb.append("\n\n---\n💡 Tip: Say \"mark done [task]\" as you complete each item!");

        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // SUGGEST
    // =====================================================================

    private AiConversationResponse handleSuggest(String prompt, String lower, String email, String timezone) {
        List<TaskResponse> tasks = taskService.getUserTasks(email);
        LocalDateTime userNow = nowInTimezone(timezone);

        String taskContext = buildRichTaskContext(email, timezone);
        String overdueCtx = buildOverdueContext(email, timezone);

        String geminiPrompt = "You are SmartTask24 AI assistant. The user wants suggestions/recommendations.\n\n"
            + "Current time: " + userNow.format(DateTimeFormatter.ofPattern("h:mm a, EEEE, MMMM d, yyyy")) + "\n"
            + "User's tasks:\n" + taskContext + "\n"
            + overdueCtx + "\n"
            + "User said: \"" + prompt + "\"\n\n"
            + "INSTRUCTIONS:\n"
            + "- If they ask for task suggestions → suggest 5-8 specific actionable tasks based on their existing tasks and gaps\n"
            + "- If they ask for category suggestions → suggest 5-8 useful categories based on their task patterns\n"
            + "- If they ask for tag suggestions → suggest 8-10 useful tags\n"
            + "- If they ask for note ideas → suggest 5 note topics that would help their productivity\n"
            + "- If unclear, suggest tasks AND categories together\n"
            + "- Consider their overdue tasks and upcoming deadlines\n"
            + "- Be specific and personalized (not generic)\n"
            + "- ALWAYS respond in English\n"
            + "- Format with clear sections using emojis\n";

        String response = ollamaClient.chat(geminiPrompt);
        return conversationService.saveConversation(prompt, response, email);
    }

    // =====================================================================
    // CREATE NOTES (single + multi)
    // =====================================================================

    private AiConversationResponse handleCreateNotes(String prompt, String lower, String email) {
        Matcher countMatcher = Pattern.compile("(\\d+)\\s+(notes?)").matcher(lower);
        int count = 0;
        if (countMatcher.find()) {
            count = Math.min(Integer.parseInt(countMatcher.group(1)), 20);
        }

        // Single note: "create note what is java"
        if (count == 0) {
            // Step 1: Extract title + generate full content in one Gemini call
            String geminiPrompt = "You are a smart note-taking assistant. Given the user's request, generate:\n"
                + "Line 1: TITLE (short, max 50 chars, clean)\n"
                + "Line 2: ---\n"
                + "Line 3+: CONTENT (detailed, well-structured, helpful answer/explanation)\n\n"
                + "User said: \"" + prompt + "\"\n\n"
                + "Rules:\n"
                + "- ALWAYS respond in English\n"
                + "- If user wrote in Hindi, translate everything to English\n"
                + "- Title should be clean (remove 'create note', 'add note', 'what is' prefix)\n"
                + "- Content should be a REAL, HELPFUL answer — not just the title repeated\n"
                + "- If it's a question (what is X, how does X work), write a proper explanation\n"
                + "- If it's a topic, write organized notes with key points\n"
                + "- Use markdown: headers, bullet points, bold where useful\n"
                + "- Content length: 100-500 words depending on topic complexity\n"
                + "- Examples:\n"
                + "  User: 'create note what is java' ->\n"
                + "  Title: What is Java\n"
                + "  ---\n"
                + "  ## What is Java?\nJava is a high-level, object-oriented programming language...\n\n"
                + "  User: 'create note python vs java' ->\n"
                + "  Title: Python vs Java Comparison\n"
                + "  ---\n"
                + "  ## Python vs Java\n\n### Performance\n...\n\n### Syntax\n...\n\n"
                + "- Return ONLY the title and content in the format above";

            String response = ollamaClient.chat(geminiPrompt).trim()
                .replaceAll("\\*\\*", "");

            // Parse title and content from response
            String title;
            String content;
            String[] parts = response.split("---", 2);
            if (parts.length == 2) {
                title = parts[0].trim().replaceAll("\\n", " ")
                    .replaceAll("^Title:\\s*", "").replaceAll("^Note:\\s*", "")
                    .replaceAll("^\"|\"$", "");
                content = parts[1].trim();
            } else {
                title = response.split("\\n")[0].trim()
                    .replaceAll("^Title:\\s*", "").replaceAll("^Note:\\s*", "")
                    .replaceAll("^\"|\"$", "");
                content = response.replaceFirst("(?s)^.*?\\n", "").trim();
            }

            if (title.isEmpty() || title.length() < 2) title = extractTaskTitle(prompt);
            if (title.length() > 100) title = title.substring(0, 100);
            if (content.isEmpty() || content.length() < 5) content = title;

            // Auto-fetch diagram images from Wikipedia/Wikimedia
            content = autoFetchDiagrams(title, content);

            try {
                NoteRequest req = new NoteRequest();
                req.setTitle(capitalizeFirst(title));
                req.setContent(content);
                req.setMarkdown(true);
                NoteResponse created = noteService.createNote(req, email);
                return conversationService.saveConversation(prompt,
                    "Note created!\n\nTitle: " + created.getTitle() + "\n\n" + created.getContent(), email);
            } catch (Exception e) {
                return conversationService.saveConversation(prompt, "Failed to create note: " + e.getMessage(), email);
            }
        }

        // Multiple notes: "create 10 notes"
        String geminiPrompt = "Generate exactly " + count + " useful note titles for a task management app.\n"
            + "User said: \"" + prompt + "\"\n"
            + "Rules:\n"
            + "- Each title: max 40 chars, in English\n"
            + "- If user mentions a type (work, study), generate notes of that type\n"
            + "- Otherwise generate useful productivity note titles\n"
            + "- Return ONLY titles separated by ' | '\n"
            + "- Example: 'create 5 notes' -> Meeting notes | Weekly goals | Reading list | Ideas inbox | Journal entry";

        String response = ollamaClient.chat(geminiPrompt)
            .replaceAll("\\*\\*", "").replaceAll("\\n", " ")
            .replaceAll("(?i)^(notes?|here\\s+(are|is)\\s+(the\\s+)?notes?)\\s*:?", "").trim();

        List<String> titles = Arrays.stream(response.split("\\|"))
            .map(s -> s.trim().replaceAll("^[-*]\\s*", "").replaceAll("^\\d+\\.\\s*", ""))
            .filter(s -> s.length() > 1 && s.length() <= 50)
            .map(this::capitalizeFirst)
            .limit(count)
            .collect(Collectors.toList());

        if (titles.isEmpty()) {
            String[] defaults = {"Meeting notes", "Weekly goals", "Reading list", "Ideas", "Journal", "Project plan", "Research", "Brainstorm"};
            titles = Arrays.stream(defaults).limit(count).collect(Collectors.toList());
        }

        List<NoteResponse> created = new ArrayList<>();
        for (String title : titles) {
            try {
                NoteRequest req = new NoteRequest();
                req.setTitle(title);
                req.setContent("Created via AI assistant");
                req.setMarkdown(false);
                created.add(noteService.createNote(req, email));
            } catch (Exception e) {
                log.warn("Failed to create note {}: {}", title, e.getMessage());
            }
        }

        if (created.isEmpty()) return conversationService.saveConversation(prompt, "Failed to create notes.", email);

        StringBuilder sb = new StringBuilder();
        sb.append("Created ").append(created.size()).append(" note(s):\n\n");
        created.forEach(n -> sb.append("  📝 ").append(n.getTitle()).append("\n"));
        sb.append("\nOpen the Notes page to add content!");
        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // CREATE CATEGORIES (single + multi)
    // =====================================================================

    private AiConversationResponse handleCreateCategories(String prompt, String lower, String email) {
        Matcher countMatcher = Pattern.compile("(\\d+)\\s+(categor)").matcher(lower);
        int count = 0;
        if (countMatcher.find()) {
            count = Math.min(Integer.parseInt(countMatcher.group(1)), 20);
        }

        // Single category
        if (count == 0) {
            String name = extractCategoryName(prompt);
            if (name.isEmpty() || name.length() < 2) name = "New Category";
            String color = extractColor(lower);
            try {
                CategoryRequest req = new CategoryRequest();
                req.setName(capitalizeFirst(name));
                req.setColor(color);
                CategoryResponse created = categoryService.createCategory(req, email);
                return conversationService.saveConversation(prompt, "Category created: " + created.getName(), email);
            } catch (Exception e) {
                return conversationService.saveConversation(prompt, "Failed to create category: " + e.getMessage(), email);
            }
        }

        // Multiple categories
        String geminiPrompt = "Generate exactly " + count + " short category names for a task management app.\n"
            + "User said: \"" + prompt + "\"\n"
            + "Rules:\n"
            + "- Each name: max 20 chars, single word or two words\n"
            + "- If user mentions a type (work, study), generate categories of that type\n"
            + "- Otherwise generate common useful categories\n"
            + "- Return ONLY names separated by ' | '\n"
            + "- Example: 'create 10 categories' -> Work | Personal | Health | Study | Finance | Shopping | Home | Fitness | Creative | Travel";

        String response = ollamaClient.chat(geminiPrompt)
            .replaceAll("\\*\\*", "").replaceAll("\\n", " ")
            .replaceAll("(?i)^(categor|here\\s+(are|is)\\s+(the\\s+)?categor)\\w*\\s*:?", "").trim();

        List<String> names = Arrays.stream(response.split("\\|"))
            .map(s -> s.trim().replaceAll("^[-*]\\s*", "").replaceAll("^\\d+\\.\\s*", ""))
            .filter(s -> s.length() > 1 && s.length() <= 20)
            .map(this::capitalizeFirst)
            .limit(count)
            .collect(Collectors.toList());

        if (names.isEmpty()) {
            String[] defaults = {"Work", "Personal", "Health", "Study", "Finance", "Shopping", "Home", "Fitness", "Creative", "Travel"};
            names = Arrays.stream(defaults).limit(count).collect(Collectors.toList());
        }

        String[] colors = {"#F97316", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899", "#14B8A6", "#F43F5E"};
        List<CategoryResponse> created = new ArrayList<>();
        for (int i = 0; i < names.size(); i++) {
            try {
                CategoryRequest req = new CategoryRequest();
                req.setName(names.get(i));
                req.setColor(colors[i % colors.length]);
                created.add(categoryService.createCategory(req, email));
            } catch (Exception e) {
                log.warn("Failed to create category {}: {}", names.get(i), e.getMessage());
            }
        }

        if (created.isEmpty()) return conversationService.saveConversation(prompt, "Failed to create categories. They may already exist.", email);

        StringBuilder sb = new StringBuilder();
        sb.append("Created ").append(created.size()).append(" categor").append(created.size() > 1 ? "ies" : "y").append(":\n\n");
        created.forEach(c -> sb.append("  📁 ").append(c.getName()).append("\n"));
        if (created.size() < count) sb.append("\n(").append(count - created.size()).append(" skipped — may already exist)");
        return conversationService.saveConversation(prompt, sb.toString(), email);
    }

    // =====================================================================
    // DELETE NOTE / TAG / CATEGORY
    // =====================================================================

    private AiConversationResponse handleDeleteNote(String prompt, String lower, String email) {
        try {
            var notes = noteService.getUserNotes(email);
            if (notes.isEmpty()) return conversationService.saveConversation(prompt, "No notes to delete.", email);

            String search = lower.replaceAll("(?i)\\b(delete|remove|note|notes|the|my|a|an)\\b", "").trim();

            if (search.isEmpty()) {
                // No specific note mentioned — delete the most recent one
                NoteResponse latest = notes.get(0);
                noteService.deleteNote(latest.getId(), email);
                return conversationService.saveConversation(prompt, "Deleted note: " + latest.getTitle(), email);
            }

            // Try exact title match first
            for (var note : notes) {
                if (note.getTitle().toLowerCase().equals(search)) {
                    noteService.deleteNote(note.getId(), email);
                    return conversationService.saveConversation(prompt, "Deleted note: " + note.getTitle(), email);
                }
            }
            // Then try contains match
            for (var note : notes) {
                if (note.getTitle().toLowerCase().contains(search) || search.contains(note.getTitle().toLowerCase())) {
                    noteService.deleteNote(note.getId(), email);
                    return conversationService.saveConversation(prompt, "Deleted note: " + note.getTitle(), email);
                }
            }
            return conversationService.saveConversation(prompt, "Couldn't find a note matching \"" + search + "\".\n\nYour notes:\n" +
                notes.stream().map(n -> "- " + n.getTitle()).collect(Collectors.joining("\n")), email);
        } catch (Exception e) {
            log.error("Failed to delete note", e);
            return conversationService.saveConversation(prompt, "Failed to delete note: " + e.getMessage(), email);
        }
    }

    private AiConversationResponse handleDeleteTag(String prompt, String lower, String email) {
        return conversationService.saveConversation(prompt,
            "To delete a tag, go to the Tags page and click the delete button on the tag you want to remove.", email);
    }

    private AiConversationResponse handleDeleteCategory(String prompt, String lower, String email) {
        return conversationService.saveConversation(prompt,
            "To delete a category, go to the Categories page and click the delete button on the category you want to remove.", email);
    }

    // =====================================================================
    // LIST NOTES
    // =====================================================================

    private AiConversationResponse handleListNotes(String prompt, String email) {
        try {
            var notes = noteService.getUserNotes(email);
            if (notes.isEmpty()) return conversationService.saveConversation(prompt, "No notes yet. Want me to create some?", email);
            StringBuilder sb = new StringBuilder();
            sb.append("Your notes (").append(notes.size()).append("):\n\n");
            notes.forEach(n -> sb.append("  📝 ").append(n.getTitle()).append("\n"));
            return conversationService.saveConversation(prompt, sb.toString(), email);
        } catch (Exception e) {
            return conversationService.saveConversation(prompt, "Failed to load notes.", email);
        }
    }

    // =====================================================================
    // FORMATTING HELPERS
    // =====================================================================

    private String formatCreatedTask(TaskResponse t) {
        StringBuilder sb = new StringBuilder();
        sb.append("Task created!\n\n");
        sb.append(t.getTitle()).append("\n");
        sb.append("  Priority: ").append(t.getPriority()).append("\n");
        if (t.getEstimatedTime() != null && t.getEstimatedTime() > 0) sb.append("  Est. Time: ").append(t.getEstimatedTime()).append(" min\n");
        if (t.getDueDate() != null) sb.append("  Due: ").append(t.getDueDate().format(DateTimeFormatter.ofPattern("MMM d, yyyy"))).append("\n");
        if (t.getCategoryName() != null) sb.append("  Category: ").append(t.getCategoryName()).append("\n");
        if (t.getTags() != null && !t.getTags().isEmpty()) {
            sb.append("  Tags: ").append(t.getTags().stream().map(TagResponse::getName).collect(Collectors.joining(", "))).append("\n");
        }
        if (t.getSubtasks() != null && !t.getSubtasks().isEmpty()) {
            sb.append("  Subtasks:\n");
            for (var sub : t.getSubtasks()) sb.append("    - ").append(sub.getTitle()).append("\n");
        }
        return sb.toString();
    }

    private String formatCreatedTasks(List<TaskResponse> created) {
        if (created.isEmpty()) return "Failed to create tasks.";
        StringBuilder sb = new StringBuilder();
        sb.append("Created ").append(created.size()).append(" task(s):\n\n");
        created.forEach(t -> sb.append("  [").append(t.getId()).append("] ").append(t.getTitle()).append(" (").append(t.getPriority()).append(")\n"));
        if (created.size() > 1) sb.append("\nWant me to update or organize any of these?");
        return sb.toString();
    }

    private String formatTaskList(List<TaskResponse> tasks) {
        if (tasks.isEmpty()) return "  (No tasks)\n";
        StringBuilder sb = new StringBuilder();
        tasks.stream().limit(10).forEach(t ->
            sb.append("  [").append(t.getId()).append("] ").append(t.getTitle())
              .append(" (").append(t.getPriority()).append(")\n"));
        if (tasks.size() > 10) sb.append("  ... and ").append(tasks.size() - 10).append(" more\n");
        return sb.toString();
    }

    // =====================================================================
    // EXTRACTION HELPERS
    // =====================================================================

    private LocalDateTime extractDueDate(String prompt) {
        return extractDueDate(prompt, null);
    }

    private LocalDateTime extractDueDate(String prompt, String timezone) {
        String lower = prompt.toLowerCase();
        LocalDateTime now = timezone != null ? nowInTimezone(timezone) : LocalDateTime.now();

        // ===== YESTERDAY / TODAY / TOMORROW =====
        if (lower.contains("yesterday")) return now.minusDays(1).withHour(23).withMinute(59);
        if (lower.contains("today") || lower.contains("aaj")) return now.withHour(23).withMinute(59);
        if (lower.contains("tomorrow") || lower.contains("kal")) return now.plusDays(1).withHour(23).withMinute(59);
        if (lower.contains("day after tomorrow") || lower.contains("parson")) return now.plusDays(2).withHour(23).withMinute(59);

        // ===== DAY OF WEEK (English + Hindi) =====
        String[][] dayMappings = {
            {"monday", "somvar"}, {"tuesday", "mangalvar"}, {"wednesday", "budhvar"},
            {"thursday", "guruvar"}, {"friday", "shukravar"}, {"saturday", "shanivar"}, {"sunday", "ravivar"}
        };
        String[] dayNames = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"};

        for (int i = 0; i < dayNames.length; i++) {
            for (String dayWord : dayMappings[i]) {
                if (lower.contains("next " + dayWord) || lower.contains(dayWord)) {
                    int targetDay = i + 1;
                    int currentDay = now.getDayOfWeek().getValue();
                    int daysUntil = (targetDay - currentDay + 7) % 7;
                    if (daysUntil == 0) daysUntil =7;
                    return now.plusDays(daysUntil).withHour(23).withMinute(59);
                }
            }
        }

        // ===== RELATIVE DAYS: "in 3 days", "in 1 week", "in 2 hours" =====
        Matcher inMatcher = Pattern.compile("in\\s+(\\d+)\\s+(days?|weeks?|hours?|minutes?)").matcher(lower);
        if (inMatcher.find()) {
            int val = Integer.parseInt(inMatcher.group(1));
            String unit = inMatcher.group(2);
            if (unit.startsWith("day")) return now.plusDays(val).withHour(23).withMinute(59);
            if (unit.startsWith("week")) return now.plusWeeks(val).withHour(23).withMinute(59);
            if (unit.startsWith("hour")) return now.plusHours(val);
            if (unit.startsWith("minute")) return now.plusMinutes(val);
        }

        // ===== "by Friday", "before Monday", "till Saturday" =====
        Matcher byMatcher = Pattern.compile("(by|before|until|till|due)\\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)").matcher(lower);
        if (byMatcher.find()) {
            String dayName = byMatcher.group(2);
            for (int i = 0; i < dayNames.length; i++) {
                if (dayName.equals(dayNames[i])) {
                    int targetDay = i + 1;
                    int currentDay = now.getDayOfWeek().getValue();
                    int daysUntil = (targetDay - currentDay + 7) % 7;
                    if (daysUntil == 0) daysUntil = 7;
                    return now.plusDays(daysUntil).withHour(23).withMinute(59);
                }
            }
        }

        // ===== EXPLICIT DATES: "July 15", "15th July", "15/07", "07-15", "on 15th" =====
        String[] monthNames = {"january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"};
        String[] monthShort = {"jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"};

        // "July 15", "july 15th", "on July 15", "on 15th July", "15 July", "15th july"
        for (int m = 0; m < 12; m++) {
            // "monthName day" e.g. "july 15", "july 15th"
            Matcher monthDay = Pattern.compile("(?:on\\s+)?(?:" + monthNames[m] + "|" + monthShort[m] + ")\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{4}))?").matcher(lower);
            if (monthDay.find()) {
                int day = Integer.parseInt(monthDay.group(1));
                int year = monthDay.group(2) != null ? Integer.parseInt(monthDay.group(2)) : now.getYear();
                return now.withYear(year).withMonth(m + 1).withDayOfMonth(Math.min(day, now.withMonth(m + 1).withDayOfMonth(1).toLocalDate().lengthOfMonth())).withHour(23).withMinute(59);
            }
            // "day monthName" e.g. "15 july", "15th july"
            Matcher dayMonth = Pattern.compile("(?:on\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+" + monthNames[m] + "(?:\\s*,?\\s*(\\d{4}))?").matcher(lower);
            if (dayMonth.find()) {
                int day = Integer.parseInt(dayMonth.group(1));
                int year = dayMonth.group(2) != null ? Integer.parseInt(dayMonth.group(2)) : now.getYear();
                return now.withYear(year).withMonth(m + 1).withDayOfMonth(Math.min(day, now.withMonth(m + 1).withDayOfMonth(1).toLocalDate().lengthOfMonth())).withHour(23).withMinute(59);
            }
        }

        // "15/07" or "07/15" or "15-07" or "07-15" or "on 15/07"
        Matcher slashDate = Pattern.compile("(?:on\\s+)?(\\d{1,2})[/\\-](\\d{1,2})(?:[/\\-](\\d{2,4}))?").matcher(lower);
        if (slashDate.find()) {
            int first = Integer.parseInt(slashDate.group(1));
            int second = Integer.parseInt(slashDate.group(2));
            int year = slashDate.group(3) != null ? Integer.parseInt(slashDate.group(3)) : now.getYear();
            if (year < 100) year += 2000;
            int month, day;
            if (first > 12) { month = second; day = first; } // dd/MM
            else if (second > 12) { month = first; day = second; } // MM/dd
            else { month = first; day = second; } // ambiguous, assume MM/dd
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                return now.withYear(year).withMonth(month).withDayOfMonth(Math.min(day, now.withMonth(month).withDayOfMonth(1).toLocalDate().lengthOfMonth())).withHour(23).withMinute(59);
            }
        }

        // "on 15th" or "on 15" (just a day number, assume current or next month)
        Matcher bareDay = Pattern.compile("(?:on\\s+)?(\\d{1,2})(?:st|nd|rd|th)\\b").matcher(lower);
        if (bareDay.find()) {
            int day = Integer.parseInt(bareDay.group(1));
            if (day >= 1 && day <= 31) {
                int maxDay = now.withDayOfMonth(1).toLocalDate().lengthOfMonth();
                if (day <= maxDay) {
                    LocalDateTime target = now.withDayOfMonth(Math.min(day, maxDay)).withHour(23).withMinute(59);
                    if (target.isBefore(now)) target = target.plusMonths(1);
                    return target;
                }
            }
        }

        // ===== ENGLISH TIME: "at 3pm", "at 14:00", "3:30 PM" =====
        Matcher timeMatcher = Pattern.compile("at\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?").matcher(lower);
        if (timeMatcher.find()) {
            return parseTime(timeMatcher.group(1), timeMatcher.group(2), timeMatcher.group(3), now);
        }

        // ===== STANDALONE TIME: "3pm", "14:00", "3:30pm" =====
        Matcher standaloneTime = Pattern.compile("\\b(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm|baje|baj\\s*kar|o\\s*clock)\\b").matcher(lower);
        if (standaloneTime.find()) {
            return parseTime(standaloneTime.group(1), standaloneTime.group(2), standaloneTime.group(3), now);
        }

        // ===== HINDI TIME: "8 baje", "8 bajkar", "raat 11 baje" =====
        Matcher hindiTime = Pattern.compile("(subah|dopahar|shaam|raat|savere|din|raat ko)?\\s*(\\d{1,2})\\s*(baje|baj\\s*kar|o\\s*clock)").matcher(lower);
        if (hindiTime.find()) {
            String period = hindiTime.group(1);
            int hour = Integer.parseInt(hindiTime.group(2));
            if (period != null) {
                if (period.equals("raat") || period.equals("raat ko")) {
                    if (hour < 12) hour += 12;
                } else if (period.equals("subah") || period.equals("savere")) {
                    if (hour == 12) hour = 0;
                } else if (period.equals("shaam")) {
                    if (hour < 12) hour += 12;
                }
            }
            return now.withHour(hour).withMinute(0);
        }

        // ===== "this evening", "tonight", "next week", "next month" =====
        if (lower.contains("this evening") || lower.contains("tonight") || lower.contains("aaj raat")) return now.withHour(20).withMinute(0);
        if (lower.contains("this morning") || lower.contains("subah")) return now.withHour(9).withMinute(0);
        if (lower.contains("this afternoon") || lower.contains("dopahar")) return now.withHour(14).withMinute(0);
        if (lower.contains("next week") || lower.contains("agle hafte")) return now.plusWeeks(1).withHour(23).withMinute(59);
        if (lower.contains("next month") || lower.contains("agle mahine")) return now.plusMonths(1).withHour(23).withMinute(59);

        return null;
    }

    private LocalDateTime parseTime(String hourStr, String minStr, String ampm, LocalDateTime now) {
        int hour = Integer.parseInt(hourStr);
        int min = minStr != null ? Integer.parseInt(minStr) : 0;
        if (ampm != null) {
            if (ampm.startsWith("pm") && hour < 12) hour += 12;
            if (ampm.startsWith("am") && hour == 12) hour = 0;
            if (ampm.equals("baje") || ampm.equals("baj") || ampm.equals("o'clock")) {
                // Hindi - no AM/PM, assume reasonable hours
            }
        }
        return now.withHour(hour).withMinute(min);
    }

    private String extractTaskTitle(String prompt) {
        String cleaned = prompt.replaceAll("(?i)\\b(create|add|make|new|task|todo|reminder|schedule|plan|set up|book|set|called|named|with title|titled|a|an|the|for|i will|i need to|i have to|i want to|i should|i'm going to|category|categories|tag|tags)\\b", " ").trim();
        cleaned = cleaned.replaceAll("(?i)\\b(morning|evening|afternoon|night|daily|weekly|monthly|at|by|before|on|every|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b", "").trim();
        cleaned = cleaned.replaceAll("(?i)\\b(urgent|high|medium|low|important|asap)\\b", "").trim();
        cleaned = cleaned.replaceAll("(?i)\\b\\d+\\s*(min|minutes|hour|hours|hr|hrs|m|h)\\b", "").trim();
        cleaned = cleaned.replaceAll("(?i)(in|under|with)\\s+(the\\s+)?(category|tag|tagged|#).*$", "").trim();
        cleaned = cleaned.replaceAll("(?i)\\b(due|by|before|until|till)\\s+\\S+", "").trim();
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        return cleaned;
    }

    private String extractTargetTaskName(String prompt) {
        String cleaned = prompt.replaceAll("(?i)\\b(delete|remove|destroy|drop|erase|trash|complete|done|finish|mark|update|edit|change|modify|rename|show|list|view|all|tasks?|todos?|the|this|that|my)\\b", " ").trim();
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        return cleaned.length() < 2 ? prompt : cleaned;
    }

    private String extractNewTitle(String prompt) {
        String[] patterns = {"rename.*to\\s+(.+)", "change.*to\\s+(.+)", "update.*to\\s+(.+)", "set title.*to\\s+(.+)"};
        for (String p : patterns) {
            Matcher m = Pattern.compile(p, Pattern.CASE_INSENSITIVE).matcher(prompt);
            if (m.find()) return m.group(1).trim();
        }
        return null;
    }

    private String extractCategoryName(String prompt) {
        String cleaned = prompt.replaceAll("(?i)\\b(create|add|make|new|category|categories|a|an|the|called|named)\\b", " ").trim();
        return cleaned.replaceAll("\\s+", " ").trim();
    }

    private String extractTagName(String prompt) {
        String cleaned = prompt.replaceAll("(?i)\\b(create|add|make|new|tag|tags|label|labels|a|an|the|called|named)\\b", " ").trim();
        return cleaned.replaceAll("\\s+", " ").trim();
    }

    private Priority extractPriority(String prompt) {
        if (prompt.contains("urgent") || prompt.contains("asap")) return Priority.URGENT;
        if (prompt.contains("high") || prompt.contains("important")) return Priority.HIGH;
        if (prompt.contains("low")) return Priority.LOW;
        return Priority.MEDIUM;
    }

    private int extractTime(String prompt) {
        Matcher m = Pattern.compile("(\\d+)\\s*(min|minutes|hour|hours|hr|hrs|m|h)", Pattern.CASE_INSENSITIVE).matcher(prompt);
        if (m.find()) {
            int val = Integer.parseInt(m.group(1));
            return m.group(2).toLowerCase().startsWith("h") ? val * 60 : val;
        }
        return -1;
    }

    private String extractColor(String prompt) {
        Map<String, String> colors = Map.of(
            "red", "#EF4444", "blue", "#3B82F6", "green", "#10B981",
            "yellow", "#F59E0B", "purple", "#8B5CF6", "orange", "#F97316",
            "pink", "#EC4899", "cyan", "#06B6D4", "teal", "#14B8A6"
        );
        for (var entry : colors.entrySet()) {
            if (prompt.contains(entry.getKey())) return entry.getValue();
        }
        return "#F97316";
    }

    private List<SubTaskRequest> extractSubtasks(String prompt) {
        List<SubTaskRequest> subtasks = new ArrayList<>();
        Matcher m = Pattern.compile("(?i)(subtask|subtasks|sub-task|sub-tasks)\\s*[:;]\\s*(.+)", Pattern.CASE_INSENSITIVE).matcher(prompt);
        if (m.find()) {
            for (String part : m.group(2).split("[,;]")) {
                String title = part.trim();
                if (!title.isEmpty()) {
                    SubTaskRequest sub = new SubTaskRequest();
                    sub.setTitle(capitalizeFirst(title));
                    subtasks.add(sub);
                }
            }
        }
        return subtasks;
    }

    private Long extractCategory(String prompt, String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return null;
        String[] patterns = {"(?i)\\bin\\s+(?:the\\s+)?(.+?)\\s+category", "(?i)\\bcategory\\s*[:=]\\s*(.+?)(?:\\s+and\\s+|$)"};
        for (String pattern : patterns) {
            Matcher m = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(prompt);
            if (m.find()) {
                String catName = m.group(1).replaceAll("(?i)\\b(task|todo|called|named)\\b", "").trim();
                if (catName.length() >= 2) {
                    var existing = categoryRepository.findByNameContainingIgnoreCaseAndUser(catName, user);
                    if (existing.isPresent()) return existing.get().getId();
                }
            }
        }
        return null;
    }

    private Set<Long> extractTags(String prompt, String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return new HashSet<>();
        Set<Long> tagIds = new HashSet<>();
        Matcher hashMatcher = Pattern.compile("#(\\w+)").matcher(prompt);
        while (hashMatcher.find()) {
            tagRepository.findByNameContainingIgnoreCaseAndUser(hashMatcher.group(1), user).ifPresent(tag -> tagIds.add(tag.getId()));
        }
        return tagIds;
    }

    private TaskResponse fuzzyFind(String search, List<TaskResponse> tasks) {
        if (search == null || search.isEmpty()) return null;
        String lower = search.toLowerCase().trim();

        for (TaskResponse t : tasks) {
            if (t.getTitle().toLowerCase().equals(lower)) return t;
        }
        for (TaskResponse t : tasks) {
            if (t.getTitle().toLowerCase().contains(lower) || lower.contains(t.getTitle().toLowerCase())) return t;
        }
        for (TaskResponse t : tasks) {
            for (String word : lower.split("\\s+")) {
                if (word.length() >= 3 && t.getTitle().toLowerCase().contains(word)) return t;
            }
        }
        try {
            long id = Long.parseLong(search.replaceAll("[^0-9]", ""));
            for (TaskResponse t : tasks) {
                if (t.getId() == id) return t;
            }
        } catch (NumberFormatException ignored) {}
        return null;
    }

    private String capitalizeFirst(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
