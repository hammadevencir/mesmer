import Image from "next/image";

export const metadata = {
  title: "Gift a Mesmer Subscription",
  description: "Pay for a Mesmer subscription on behalf of someone you care about.",
};

export default function SubscribeLayout({ children }) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{
        background:
          "linear-gradient(180.01deg, #FFFFFF 0.01%, #F5E9FC 88.16%, #FAD1F0 108.56%)",
      }}
    >
      <div className="w-full max-w-lg px-5 py-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/mesmer.png"
            alt="Mesmer"
            width={200}
            height={72}
            className="h-auto w-[180px]"
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}
