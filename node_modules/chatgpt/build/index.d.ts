import ExpiryMap from 'expiry-map';

type ContentType = 'text';
type Role = 'user' | 'assistant';
/**
 * https://chat.openapi.com/api/auth/session
 */
type SessionResult = {
    /**
     * Authenticated user
     */
    user: User;
    /**
     * ISO date of the expiration date of the access token
     */
    expires: string;
    /**
     * The access token
     */
    accessToken: string;
    /**
     * If there was an error associated with this request
     */
    error?: string | null;
};
type User = {
    /**
     * ID of the user
     */
    id: string;
    /**
     * Name of the user
     */
    name: string;
    /**
     * Email of the user
     */
    email: string;
    /**
     * Image of the user
     */
    image: string;
    /**
     * Picture of the user
     */
    picture: string;
    /**
     * Groups the user is in
     */
    groups: string[] | [];
    /**
     * Features the user is in
     */
    features: string[] | [];
};
/**
 * https://chat.openapi.com/backend-api/models
 */
type ModelsResult = {
    /**
     * Array of models
     */
    models: Model[];
};
type Model = {
    /**
     * Name of the model
     */
    slug: string;
    /**
     * Max tokens of the model
     */
    max_tokens: number;
    /**
     * Whether or not the model is special
     */
    is_special: boolean;
};
/**
 * https://chat.openapi.com/backend-api/moderations
 */
type ModerationsJSONBody = {
    /**
     * Input for the moderation decision
     */
    input: string;
    /**
     * The model to use in the decision
     */
    model: AvailableModerationModels;
};
type AvailableModerationModels = 'text-moderation-playground';
/**
 * https://chat.openapi.com/backend-api/moderations
 */
type ModerationsJSONResult = {
    /**
     * Whether or not the input is flagged
     */
    flagged: boolean;
    /**
     * Whether or not the input is blocked
     */
    blocked: boolean;
    /**
     * The ID of the decision
     */
    moderation_id: string;
};
/**
 * https://chat.openapi.com/backend-api/conversation
 */
type ConversationJSONBody = {
    /**
     * The action to take
     */
    action: string;
    /**
     * The ID of the conversation
     */
    conversation_id?: string;
    /**
     * Prompts to provide
     */
    messages: Prompt[];
    /**
     * The model to use
     */
    model: string;
    /**
     * The parent message ID
     */
    parent_message_id: string;
};
type Prompt = {
    /**
     * The content of the prompt
     */
    content: PromptContent;
    /**
     * The ID of the prompt
     */
    id: string;
    /**
     * The role played in the prompt
     */
    role: Role;
};
type PromptContent = {
    /**
     * The content type of the prompt
     */
    content_type: ContentType;
    /**
     * The parts to the prompt
     */
    parts: string[];
};
/**
 * https://chat.openapi.com/backend-api/conversation/message_feedback
 */
type MessageFeedbackJSONBody = {
    /**
     * The ID of the conversation
     */
    conversation_id: string;
    /**
     * The message ID
     */
    message_id: string;
    /**
     * The rating
     */
    rating: MessageFeedbackRating;
    /**
     * Tags to give the rating
     */
    tags?: MessageFeedbackTags[];
    /**
     * The text to include
     */
    text?: string;
};
type MessageFeedbackTags = 'harmful' | 'false' | 'not-helpful';
type MessageFeedbackResult = {
    /**
     * The message ID
     */
    message_id: string;
    /**
     * The ID of the conversation
     */
    conversation_id: string;
    /**
     * The ID of the user
     */
    user_id: string;
    /**
     * The rating
     */
    rating: MessageFeedbackRating;
    /**
     * The text the server received, including tags
     */
    text?: string;
};
type MessageFeedbackRating = 'thumbsUp' | 'thumbsDown';
type ConversationResponseEvent = {
    message?: Message;
    conversation_id?: string;
    error?: string | null;
};
type Message = {
    id: string;
    content: MessageContent;
    role: string;
    user: string | null;
    create_time: string | null;
    update_time: string | null;
    end_turn: null;
    weight: number;
    recipient: string;
    metadata: MessageMetadata;
};
type MessageContent = {
    content_type: string;
    parts: string[];
};
type MessageMetadata = any;
type SendMessageOptions = {
    conversationId?: string;
    parentMessageId?: string;
    timeoutMs?: number;
    onProgress?: (partialResponse: string) => void;
    onConversationResponse?: (response: ConversationResponseEvent) => void;
    abortSignal?: AbortSignal;
};
type SendConversationMessageOptions = Omit<SendMessageOptions, 'conversationId' | 'parentMessageId'>;

/**
 * A conversation wrapper around the ChatGPTAPI. This allows you to send
 * multiple messages to ChatGPT and receive responses, without having to
 * manually pass the conversation ID and parent message ID for each message.
 */
declare class ChatGPTConversation {
    api: ChatGPTAPI;
    conversationId: string;
    parentMessageId: string;
    /**
     * Creates a new conversation wrapper around the ChatGPT API.
     *
     * @param api - The ChatGPT API instance to use
     * @param opts.conversationId - Optional ID of a conversation to continue
     * @param opts.parentMessageId - Optional ID of the previous message in the conversation
     */
    constructor(api: ChatGPTAPI, opts?: {
        conversationId?: string;
        parentMessageId?: string;
    });
    /**
     * Sends a message to ChatGPT, waits for the response to resolve, and returns
     * the response.
     *
     * If this is the first message in the conversation, the conversation ID and
     * parent message ID will be automatically set.
     *
     * This allows you to send multiple messages to ChatGPT and receive responses,
     * without having to manually pass the conversation ID and parent message ID
     * for each message.
     *
     * @param message - The prompt message to send
     * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
     * @param opts.onConversationResponse - Optional callback which will be invoked every time the partial response is updated with the full conversation response
     * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
     *
     * @returns The response from ChatGPT
     */
    sendMessage(message: string, opts?: SendConversationMessageOptions): Promise<string>;
}

declare class ChatGPTAPI {
    protected _sessionToken: string;
    protected _markdown: boolean;
    protected _apiBaseUrl: string;
    protected _backendApiBaseUrl: string;
    protected _userAgent: string;
    protected _accessTokenCache: ExpiryMap<string, string>;
    /**
     * Creates a new client wrapper around the unofficial ChatGPT REST API.
     *
     * @param opts.sessionToken = **Required** OpenAI session token which can be found in a valid session's cookies (see readme for instructions)
     * @param apiBaseUrl - Optional override; the base URL for ChatGPT webapp's API (`/api`)
     * @param backendApiBaseUrl - Optional override; the base URL for the ChatGPT backend API (`/backend-api`)
     * @param userAgent - Optional override; the `user-agent` header to use with ChatGPT requests
     * @param accessTokenTTL - Optional override; how long in milliseconds access tokens should last before being forcefully refreshed
     */
    constructor(opts: {
        sessionToken: string;
        /** @defaultValue `true` **/
        markdown?: boolean;
        /** @defaultValue `'https://chat.openai.com/api'` **/
        apiBaseUrl?: string;
        /** @defaultValue `'https://chat.openai.com/backend-api'` **/
        backendApiBaseUrl?: string;
        /** @defaultValue `'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'` **/
        userAgent?: string;
        /** @defaultValue 60000 (60 seconds) */
        accessTokenTTL?: number;
    });
    /**
     * Sends a message to ChatGPT, waits for the response to resolve, and returns
     * the response.
     *
     * If you want to receive a stream of partial responses, use `opts.onProgress`.
     * If you want to receive the full response, including message and conversation IDs,
     * you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
     * helper.
     *
     * @param message - The prompt message to send
     * @param opts.conversationId - Optional ID of a conversation to continue
     * @param opts.parentMessageId - Optional ID of the previous message in the conversation
     * @param opts.timeoutMs - Optional timeout in milliseconds (defaults to no timeout)
     * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
     * @param opts.onConversationResponse - Optional callback which will be invoked every time the partial response is updated with the full conversation response
     * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
     *
     * @returns The response from ChatGPT
     */
    sendMessage(message: string, opts?: SendMessageOptions): Promise<string>;
    /**
     * @returns `true` if the client has a valid acces token or `false` if refreshing
     * the token fails.
     */
    getIsAuthenticated(): Promise<boolean>;
    /**
     * Refreshes the client's access token which will succeed only if the session
     * is still valid.
     */
    ensureAuth(): Promise<string>;
    /**
     * Attempts to refresh the current access token using the ChatGPT
     * `sessionToken` cookie.
     *
     * Access tokens will be cached for up to `accessTokenTTL` milliseconds to
     * prevent refreshing access tokens too frequently.
     *
     * @returns A valid access token
     * @throws An error if refreshing the access token fails.
     */
    refreshAccessToken(): Promise<string>;
    /**
     * Gets a new ChatGPTConversation instance, which can be used to send multiple
     * messages as part of a single conversation.
     *
     * @param opts.conversationId - Optional ID of the previous message in a conversation
     * @param opts.parentMessageId - Optional ID of the previous message in a conversation
     * @returns The new conversation instance
     */
    getConversation(opts?: {
        conversationId?: string;
        parentMessageId?: string;
    }): ChatGPTConversation;
}

declare function markdownToText(markdown?: string): string;

export { AvailableModerationModels, ChatGPTAPI, ChatGPTConversation, ContentType, ConversationJSONBody, ConversationResponseEvent, Message, MessageContent, MessageFeedbackJSONBody, MessageFeedbackRating, MessageFeedbackResult, MessageFeedbackTags, MessageMetadata, Model, ModelsResult, ModerationsJSONBody, ModerationsJSONResult, Prompt, PromptContent, Role, SendConversationMessageOptions, SendMessageOptions, SessionResult, User, markdownToText };
