interface CustomerPresentationProps {
  presentation: string;
}
export function CustomerPresentation({
  presentation,
}: CustomerPresentationProps) {
  if (!presentation) {
    return (
      <h2 className="font-semibold text-lg leading-tight">
        Bem-vindo(a) a Thoth!
        <br />
        Aqui você poderá acompanhar todo o processo de introdução e planejamento
        do seu negócio.
      </h2>
    );
  }

  return (
    <h2
      className="font-semibold text-lg leading-tight"
      dangerouslySetInnerHTML={{
        __html: presentation.replace(/\n/g, "<br />"),
      }}
    ></h2>
  );
}
