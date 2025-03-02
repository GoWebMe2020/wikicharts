// Here I define the shape of my data items.
// If you need it in multiple places, you could move it to a /models directory.
export type DataPoint = {
  date: string;
  mark: number;
  athlete: string;
  venue: string;
};
