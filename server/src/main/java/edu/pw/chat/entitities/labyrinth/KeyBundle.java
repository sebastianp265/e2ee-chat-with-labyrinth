package edu.pw.chat.entitities.labyrinth;

import edu.pw.chat.entitities.ChatUser;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;

@Entity
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class KeyBundle {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private ChatUser chatUser;

    private byte[] deviceKeyPub;

    private byte[] epochStorageKeyPub;
    private byte[] epochStorageKeySig;

    private byte[] epochStorageAuthKeyPub;
    private byte[] epochStorageAuthKeySig;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        KeyBundle keyBundle = (KeyBundle) o;
        return getId() != null && Objects.equals(getId(), keyBundle.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
