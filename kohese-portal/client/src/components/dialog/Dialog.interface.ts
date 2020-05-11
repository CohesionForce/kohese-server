export interface Dialog {
  // Optional to be considered valid by default
  isValid?: () => boolean;
  close: (accept: boolean) => any;
}
