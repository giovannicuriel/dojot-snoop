export class MetricsRegistry {
  public accumulated: number[];
  public blockSize: number;
  public messageCounter: number;

  constructor() {
    this.accumulated = [];
    this.blockSize = 0;
    this.messageCounter = 0;
  }

  public incrMesssage() {
    this.messageCounter++;
    if (this.messageCounter % this.blockSize === 0) {
      this.accumulated.push(Date.now());
    }
  }

  public clearMessageCounters(blockSize?: number) {
    this.accumulated = [];
    this.blockSize = blockSize || 1000;
    this.messageCounter = 0;
  }
}
