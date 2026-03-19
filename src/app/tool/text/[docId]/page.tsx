// src/app/tool/text/[docId]/page.tsx
export default function TextToolPage({
  params,
}: {
  params: { docId: string };
}) {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">📝 Document: {params.docId}</h1>
      <textarea
        className="w-full h-[70vh] border border-gray-300 rounded p-4"
        placeholder="Typ hier je tekst..."
      />
    </div>
  );
}
