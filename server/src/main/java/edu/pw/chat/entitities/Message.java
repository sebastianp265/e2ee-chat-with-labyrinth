package edu.pw.chat.entitities;

import edu.pw.chat.entitities.labyrinth.Device;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.util.Objects;

@Entity
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
@Table(indexes = {
        @Index(name="inbox_thread_timestamp_index", columnList = "inbox_id, thread_id, timestamp")
})
public class Message {

    @ManyToOne
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long messageId;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private ChatUser author;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private String messageData;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Message message = (Message) o;
        return getMessageId() != null && Objects.equals(getMessageId(), message.getMessageId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

