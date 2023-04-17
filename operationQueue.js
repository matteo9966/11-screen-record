/**
 * @typedef {(operationQueue:OperationQueue,data:any)=>Promise<void>} handler
 */

/** 
@exampe 
async function operationHandler(opqueue, data){
    opqueue.busy=true;
    await takesometime(data);
    opqueue.busy=false;
    opqueue.executeOperation();
     console.log("completed!")
}


const operationQueue = new OperationQueue(operationHandler);
const queue = ['one','two','three','four','five'];

operationQueue.queue=queue;
operationQueue.enqueue('six');
operationQueue.enqueue('seven');
operationQueue.enqueue('eight');
operationQueue.enqueue('nine');
operationQueue.enqueue('ten');

process.stdin.setEncoding('utf8');
process.stdin.on('data',(data)=>{
    const stringdata = data.toString();
    operationQueue.enqueue(stringdata);
})
 */
export class OperationQueue {
  /**@type {string[]}*/ queue = [];
  /**@type {boolean} */ busy = false;
  /**@type {handler} */ operationHandler;

  constructor(
    /**@type {(operationQueue:OperationQueue,data:any)=>Promise<void>}*/ operationHandler
  ) {
    this.operationHandler = operationHandler;
  }

  async executeOperation() {
    if (this.busy) return;
    const data = this.dequeue();
    if (!data) return;
    await this.operationHandler(this, data);
  }

  dequeue() {
    const data = this.queue.shift();
    return data;
  }

  async enqueue(/**@type {string}*/ data) {
   data && this.queue.push(data);
   await this.executeOperation();
  }
}

//EXAMPLE USAGE OF THE QUEUE: 

async function takesometime(data) {
  return new Promise((res, _) => {
    setTimeout(() => {
      console.log('handled data: ',data);
      res("resolved");
    }, 1000);
  });
}


