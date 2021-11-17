import AsyncLock from 'async-lock'
import chalk from 'chalk'

abstract class Test {
  async startJob(): Promise<void> {
    console.log(chalk.gray.italic('>> Job start signal.'))
    await this._startJob()
  }

  abstract _startJob(): Promise<void>

  async stopJob(): Promise<void> {
    console.log(chalk.gray.italic('>> Job stop signal.'))
    await this._stopJob()
  }

  abstract _stopJob(): Promise<void>

  async test(): Promise<void> {
    this.label('start')
    const start = this.startJob()
    const end = this.sleep(100).then(() => this.stopJob())
    await Promise.all([start, end])
    this.label('end')
  }

  async startDummyProc() {
    console.log(chalk.green('  + starting...'))
    await this.sleep(3_000)
    console.log(chalk.green('  + started.'))
  }

  async stopDummyProc() {
    console.log(chalk.yellow('  - stopping...'))
    await this.sleep(1_000)
    console.log(chalk.yellow('  - stopped.'))
  }

  sleep = (durationMillis: number) =>
    new Promise((resolve) => setTimeout(resolve, durationMillis))

  label(startOrEnd: 'start' | 'end') {
    const name = this.constructor.name
    if (startOrEnd === 'start') {
      console.log('='.repeat(80))
      console.log(`= ${name}`)
      console.log('='.repeat(80))
    } else {
      console.log('')
    }
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

class UseAsyncLockPackage extends Test {
  private readonly lock = new AsyncLock()

  async _startJob(): Promise<void> {
    return this.lock.acquire('job', async () => {
      await this.startDummyProc()
    })
  }

  async _stopJob(): Promise<void> {
    return this.lock.acquire('job', async () => {
      await this.stopDummyProc()
    })
  }
}

async function main() {
  await new Problem().test()
  await new UseAsyncLockPackage().test()
}

main()
