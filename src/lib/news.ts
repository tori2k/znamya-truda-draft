type NewsEntry = {
  id: string;
  data: {
    date: Date;
    publishedAt?: Date;
  };
};

// Новые дни показываем выше, внутри дня более поздние публикации тоже выше.
// У старых записей publishedAt нет, поэтому считаем их началом дня.
export const compareNewsByPublication = (a: NewsEntry, b: NewsEntry): number => {
  const byDay = b.data.date.getTime() - a.data.date.getTime();
  if (byDay !== 0) return byDay;

  const aPublishedAt = a.data.publishedAt?.getTime() ?? a.data.date.getTime();
  const bPublishedAt = b.data.publishedAt?.getTime() ?? b.data.date.getTime();
  const byPublicationTime = bPublishedAt - aPublishedAt;
  if (byPublicationTime !== 0) return byPublicationTime;

  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};
