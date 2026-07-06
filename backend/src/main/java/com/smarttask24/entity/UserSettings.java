package com.smarttask24.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String theme;

    private String language;

    private String timezone;

    @Column(name = "reminder_time")
    private String reminderTime;

    @Column(name = "email_reminders")
    private boolean emailReminders;

    @Column(name = "notification_enabled")
    private boolean notificationEnabled;

    @Column(name = "ai_enabled")
    private boolean aiEnabled;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
