export interface ServerToClientEvents {
    users: (users: string[]) => void;
    resposta: (mensagem: string) => void;
}

export interface ClientToServerEvents {
    mensagem: (texto: string) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    name: string;
    userId: string;
}
