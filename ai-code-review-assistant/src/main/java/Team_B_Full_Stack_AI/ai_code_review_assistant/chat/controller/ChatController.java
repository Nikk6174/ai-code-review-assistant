package Team_B_Full_Stack_AI.ai_code_review_assistant.chat.controller;

import Team_B_Full_Stack_AI.ai_code_review_assistant.auth.exception.UnauthorizedException;
import Team_B_Full_Stack_AI.ai_code_review_assistant.database.entity.UserEntity;
import Team_B_Full_Stack_AI.ai_code_review_assistant.chat.entity.ChatMessageEntity;
import Team_B_Full_Stack_AI.ai_code_review_assistant.chat.entity.ChatSessionEntity;
import Team_B_Full_Stack_AI.ai_code_review_assistant.chat.entity.Role;
import Team_B_Full_Stack_AI.ai_code_review_assistant.chat.entity.AiModel;
import Team_B_Full_Stack_AI.ai_code_review_assistant.chat.service.ChatService;
import Team_B_Full_Stack_AI.ai_code_review_assistant.chat.service.AiService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.List;
import java.util.UUID;

@Controller
public class ChatController {

    private final ChatService chatService;
    private final AiService aiService;

    public ChatController(ChatService chatService, AiService aiService) {
        this.chatService = chatService;
        this.aiService = aiService;
    }

    @QueryMapping
    public List<ChatSessionEntity> getSessions(
            @Argument UUID userId,
            @ContextValue(name = "currentUser", required = false) UserEntity currentUser) {
        
        if (currentUser == null) {
            throw new UnauthorizedException("Session is required");
        }
        if (!currentUser.getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to user sessions");
        }
        return chatService.getUserSessions(userId);
    }

    @QueryMapping
    public List<ChatMessageEntity> getMessages(
            @Argument UUID sessionId,
            @ContextValue(name = "currentUser", required = false) UserEntity currentUser) {
        
        if (currentUser == null) {
            throw new UnauthorizedException("Session is required");
        }
        ChatSessionEntity session = chatService.getSessionById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Chat session not found with ID: " + sessionId));
        
        if (!session.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Unauthorized access to session messages");
        }
        return chatService.getMessages(sessionId);
    }

    @MutationMapping
    public ChatSessionEntity createNewSession(
            @Argument UUID userId,
            @Argument String title,
            @ContextValue(name = "currentUser", required = false) UserEntity currentUser) {
        
        if (currentUser == null) {
            throw new UnauthorizedException("Session is required");
        }
        if (!currentUser.getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized session creation");
        }
        return chatService.createNewSession(userId, title);
    }

    @MutationMapping
    public ChatMessageEntity saveMessage(
            @Argument UUID sessionId,
            @Argument Role role,
            @Argument String message,
            @Argument AiModel model,
            @ContextValue(name = "currentUser", required = false) UserEntity currentUser) {
        
        if (currentUser == null) {
            throw new UnauthorizedException("Session is required");
        }
        ChatSessionEntity session = chatService.getSessionById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Chat session not found with ID: " + sessionId));
        
        if (!session.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Unauthorized access to save messages");
        }
        
        ChatMessageEntity savedUserMessage = chatService.saveMessage(sessionId, role, message);
        
        if (role == Role.USER && model != null) {
            List<ChatMessageEntity> history = chatService.getMessages(sessionId);
            String aiResponse = aiService.generateReview(history, model);
            return chatService.saveMessage(sessionId, Role.AI, aiResponse);
        }
        
        return savedUserMessage;
    }
}
