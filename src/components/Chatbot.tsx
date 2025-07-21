import { BotIcon } from "./icons/BotIcon";

export const Chatbot = () => {
  return (
    <div className="fixed bottom-5 right-5 m-4 z-50 flex flex-col items-end hidden">
      <div className="relative">
        <span className="absolute bottom-[80%] right-5 mb-2 bg-[var(--color-surface)] rounded-full p-2 px-4 items-center justify-center whitespace-nowrap opacity-100 transition-all">Asistente virtual</span>
        <BotIcon className="bg-[var(--color-surface)] shadow-lg rounded-full p-4 w-16 h-16 flex items-center justify-center cursor-pointer" />
      </div>
    </div>
  );
}
