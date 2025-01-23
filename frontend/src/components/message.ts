export enum Sender {
    USER = "user",
    BOT = "bot"
}

export enum MessageType {
    RESULT = "result",
    HISTORY = "history",
    ERROR = "error"
}

export type Message = {
    sender: Sender
    lines: string[]
    type: MessageType
}

export type History = {
    expression: string;
    result: string;
}
