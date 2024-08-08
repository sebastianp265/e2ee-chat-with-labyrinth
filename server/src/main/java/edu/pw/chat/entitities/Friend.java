package edu.pw.chat.entitities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class Friend {

    @EmbeddedId
    private FriendId id;

    @ManyToOne
    @MapsId("userId")
    private ChatUser user;

    @ManyToOne
    @MapsId("friendId")
    private ChatUser friend;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendId implements Serializable {
        private Long userId;
        private Long friendId;

        @Override
        public final boolean equals(Object o) {
            if (this == o) return true;
            if (o == null) return false;
            Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
            Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
            if (thisEffectiveClass != oEffectiveClass) return false;
            FriendId friendId1 = (FriendId) o;
            return userId != null && Objects.equals(userId, friendId1.userId)
                    && friendId != null && Objects.equals(friendId, friendId1.friendId);
        }

        @Override
        public final int hashCode() {
            return Objects.hash(userId, friendId);
        }
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Friend friend = (Friend) o;
        return getId() != null && Objects.equals(getId(), friend.getId());
    }

    @Override
    public final int hashCode() {
        return Objects.hash(id);
    }
}
