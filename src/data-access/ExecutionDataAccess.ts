//Data Access Layer
const { PrismaClient, Prisma, EventType } = require("@prisma/client");
const client = new PrismaClient();

class ExecutionDataAccess {

    async saveExecution(currentBlock: number, eventType: number) {
        // Save the current execution
        try  {
            await client.execution.create({
                data: {
                    lastBlockNumber: currentBlock,
                    event: eventType
                },
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    console.log(
                        `Unique constraint violation, execution for block ${currentBlock} and event type ${eventType} is already saved.`
                    );
                }
            } else {
                throw e;
            }
        }    
    }

    async getLatestExecutionBlock(eventType: number): Promise<number> {
        const lastExecution = await client.execution.findFirst({
            where: {
                event: {
                    equals: eventType,
                },
            },
            orderBy: [
                {
                    lastBlockNumber: "desc",
                },
            ],
        });

        return lastExecution? Number(lastExecution.lastBlockNumber) : 0; 
    }
}

module.exports = ExecutionDataAccess;