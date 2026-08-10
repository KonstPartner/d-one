export type CustomMarkedDates = {
  [key: string]: {
    selected?: boolean;
    selectedColor?: string;
    marked?: boolean;
    dotColor?: string;
  };
};

export type DateTime = {
  hours: string;
  minutes: string;
};
