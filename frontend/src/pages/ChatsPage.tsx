import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChats } from "@/hooks/useChats";
import { cn } from "@/lib/utils";

export function ChatsPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: chats } = useChats(session?.phoneNumber);
  const activeChat = chats?.find((chat) => chat._id === chatId);

  return (
    <div className="grid h-full grid-cols-1 sm:grid-cols-[320px_1fr]">
      <div className={cn("h-full min-h-0", chatId && "hidden sm:block")}>
        <ChatList
          activeChatId={chatId}
          onSelect={(id) => navigate(`/chats/${id}`)}
        />
      </div>
      <div className={cn("h-full min-h-0", !chatId && "hidden sm:block")}>
        {chatId ? (
          <ChatWindow
            key={chatId}
            chatId={chatId}
            chat={activeChat}
            onBack={() => navigate("/chats")}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare className="size-10" />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
