import { CheckCircle, Clock, Target } from 'lucide-react';

type Props = {
  completedCount: number;
  totalTime: string;
  accuracy: number;
};

export function StatsCards({ completedCount, totalTime, accuracy }: Props) {
  const cards = [
    {
      label: 'Completed',
      value: completedCount.toString(),
      icon: CheckCircle,
      color: 'text-success',
    },
    { label: 'Total Time', value: totalTime, icon: Clock, color: 'text-primary' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: Target, color: 'text-warning' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl bg-background-secondary p-6">
          <div className="flex items-center gap-3 mb-2">
            <card.icon size={20} className={card.color} />
            <span className="text-sm text-text-secondary">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
