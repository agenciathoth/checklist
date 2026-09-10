import Image from "next/image";

export function Header() {
  return (
    <header
      className="relative w-full aspect-[600/180] bg-white bg-cover bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: 'url("/bg.svg")',
      }}
    >
      <div className="absolute left-[12%] top-[50%] w-[36%] sm:w-[44%] translate-y-[-50%]">
        <Image
          src="/logo.svg"
          alt="thoth"
          width={440}
          height={101}
          className="w-full h-auto"
        />
      </div>
      <div className="absolute right-[3%] bottom-[25%] w-[30%] sm:bottom-[15%] sm:w-[34%]">
        <Image
          src="/info.svg"
          alt="Nosso horário"
          width={342}
          height={49}
          className="w-full h-auto"
        />
      </div>
    </header>
  );
}
