export type IState = {
  user: {
    address: string;
  };
  toggle: boolean;
  connected: boolean;
  balance: number;
  transactions: [];
  sended: false;
  received: false;
  last_claimed: Record<string, unknown>;
};
const initailState = {
  user: {
    address: "0x1234567890"
  },
  toggle: false,
  connected: false,
  balance: 1000,
  transactions: [
    // {
    //     id: 1,
    //     type: "send",
    //     amount: 100,
    //     address: "0x1234567890",
    //     date: "2021-10-10",
    //     status: "pending",
    // },
    // {
    //     id: 2,
    //     type: "send",
    //     amount: 100,
    //     address: "0x1234567890",
    //     date: "2021-10-10",
    //     status: "pending",
    // },
  ],
  sended: false,
  received: false,
  last_claimed: {}
};

const getMaxId = (transactions: any) => {
  let max = 0;
  transactions.forEach((transaction: any) => {
    if (transaction.id > max) {
      max = transaction.id;
    }
  });
  return max;
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "toggle":
      return { ...state, toggle: !state.toggle, sended: false };
    case "connect":
      return { ...state, connected: true };
    case "disconnect":
      return { ...state, connected: false };
    case "send":
      return {
        ...state,
        balance: state.balance - action.payload.eth,
        transactions: [
          {
            id: getMaxId(state.transactions) + 1,
            type: "send",
            amount: action.payload.eth,
            address: action.payload.address,
            passphrase: action.payload.passphrase,
            date: new Date().toISOString().split("T")[0],
            status: "pending",
            TxId: "0x1234567890"
          },
          ...state.transactions
        ]
      };
    case "recieve":
      return {
        ...state,
        balance: state.balance + action.payload.eth,
        transactions: [
          {
            id: getMaxId(state.transactions) + 1,
            type: "recieve",
            amount: action.payload.eth,
            address: action.payload.address,
            date: new Date().toISOString().split("T")[0],
            status: "pending",
            TxId: "0x1234567890"
          },
          ...state.transactions
        ]
      };
    case "cancel_transaction":
      return {
        ...state,
        //update stutus of transaction
        transactions: state.transactions.map((transaction: any) => {
          if (transaction.id === action.payload) {
            return { ...transaction, status: "cancelled", type: "cancel" };
          }
          return transaction;
        })
      };

    case "claim_transaction":
      return {
        ...state,
        //update stutus of transaction
        transactions: state.transactions.map((transaction: any) => {
          if (transaction.id === action.payload) {
            return { ...transaction, status: "complete", type: "recieve" };
          }
          return transaction;
        }),
        //update balance
        balance:
          state.balance + state.transactions.find((transaction: any) => transaction.id === action.payload).amount,

        //update last claimed
        last_claimed: {}
      };

    case "sended_transaction":
      return {
        ...state,
        sended: true
      };
    case "reset_sended":
      return {
        ...state,
        sended: false
      };
    case "received_transaction":
      return {
        ...state,
        received: true
      };
    case "reset_received":
      return {
        ...state,
        received: false
      };
    case "claimed_transaction":
      return {
        ...state,
        last_claimed: action.payload
      };

    default:
      return state;
  }
};

export { initailState, reducer };
