import {Chain, SignTransactionResponse, User, UALErrorType} from 'universal-authenticator-library'
import {WaxJS} from "@waxio/waxjs/dist"
import { OreId, AuthProvider, ChainNetwork } from "oreid-js"
import {UALOreError} from "./UALOreError";


export class OreUser extends User {
    public readonly accountName: string;
    public readonly requestPermission: string;

    private readonly pubKeys: string[];
    private readonly ore: OreId;
    private readonly chain: Chain;
    public transactioncomplete: any;
    public api: any;
    // public rpc: any;

    constructor(chain: Chain, userAccount: string, pubKeys: string[], ore: OreId) {
        super();

        this.accountName = userAccount;
        this.pubKeys = pubKeys;
        this.requestPermission = 'active';

        this.chain = chain;
        this.ore = ore;
        this.transactioncomplete = "None"
    }

    /**
     * @param transaction  The transaction to be signed (a object that matches the RpcAPI structure).
     * @param options  Options for tapos fields
     */
    async signTransaction(transactionBody: any, options: any): Promise<SignTransactionResponse> {
        
        console.log("transaction signing");
        try {
            const transaction = await this.ore.createTransaction({
                chainAccount: this.accountName,
                chainNetwork: ChainNetwork.WaxTest,
                //@ts-ignore
                transaction: transactionBody,
                signOptions: {
                    broadcast: true,
                    returnSignedTransaction: false,
                },
            })

            await this.ore.popup.sign({transaction}).then((result: any) => {
                const signedResponse: SignTransactionResponse ={
                    /** Was the transaction broadcast */
                    wasBroadcast: true,
                    /** The transcation id (optional) */
                    transactionId: result.transactionId,
                    /** The status of the transaction as returned by the RPC API (optional) */
                    status: "TestMode",
                    /** Set if there was an error */
                    error: {
                        /** The error code */
                        code: "Error",
                        /** The error message */
                        message: "Message",
                        /** The error name */
                        name: "Name"
                    },
                    /** The raw transaction object */
                    transaction: transaction.data
                }
                this.transactioncomplete = signedResponse
                
            })
            return this.transactioncomplete
        } catch (e) {
            throw new UALOreError(
                'Unable to sign transaction',
                UALErrorType.Signing,
                null
            );
        }
    }

    async signArbitrary(): Promise<string> {
        throw new UALOreError(
            'ORE ID Wallet does not currently support signArbitrary',
            UALErrorType.Unsupported, null
        );
    }

    async verifyKeyOwnership(): Promise<boolean> {
      throw new UALOreError(
          'ORE ID does not currently support verifyKeyOwnership',
          UALErrorType.Unsupported, null
      );
    }

    async getAccountName(): Promise<string> {
        return this.accountName;
    }

    async getChainId(): Promise<string> {
        return this.chain.chainId;
    }

    async getKeys() {
        return this.pubKeys;
    }
}
