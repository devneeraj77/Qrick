import { QRickGenerator } from '@/components/qrick-generator';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 lg:p-8">
      <QRickGenerator />
    </main>
  );
}
