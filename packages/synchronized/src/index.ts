abstract class Test {
  async startJob(): Promise<void> {
    console.log('Job starting...')
    await this._startJob()
    console.log('Job started.')
  }

  abstract _startJob(): Promise<void>

  async stopJob(): Promise<void> {
    console.log('Job stopping...')
    await this._stopJob()
    console.log('Job stopped.')
  }

  abstract _stopJob(): Promise<void>

  async test(): Promise<void> {
    this.label('start')
    const start = this.startJob()
    const end = this.sleep(100).then(() => this.stopJob())
    await Promise.all([start, end])
    this.label('end')
  }

  startDummyProc = () => this.sleep(1_000)

  stopDummyProc = () => this.sleep(100)

  sleep = (durationMillis: number) =>
    new Promise((resolve) => setTimeout(resolve, durationMillis))

  label(startOrEnd: 'start' | 'end') {
    const name = this.constructor.name
    console.log(`-- ${name} - ${startOrEnd} ${'-'.repeat(80 - name.length - startOrEnd.length - 7)}`)
  }
}

class Problem extends Test {
  async _startJob(): Promise<void> {
    await this.startDummyProc()
  }

  async _stopJob(): Promise<void> {
    await this.stopDummyProc()
  }
}

async function main() {
  await new Problem().test()
}

main()
