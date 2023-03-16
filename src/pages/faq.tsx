export default function Faq() {
  return (
    <section className="w-screen h-[calc(100vh-7.5rem)] font-Lato">
      <div className="w-11/12 md:max-w-7xl h-full mx-auto space-y-8 my-11">
        <h1 className="text-primary font-bold text-3xl">FAQ</h1>
        <div className=" space-y-8">
          <div className=" space-y-2">
            <h2 className="font-bold text-xl">Q: How does SafuSend work?</h2>
            <p>
              SafuSend offers a decentralized solution through a smart contract that allows users to securely send
              assets to their designated receiver without having to worry about typing the wrong address and provides
              them the ability to reclaim their funds in case they've sent it to the wrong address. This allows users to
              send assets without the need for test transactions and worrying if the address they sent to was incorrect.
            </p>
          </div>
          <div className=" space-y-2">
            <h2 className="font-bold text-xl">Q: Why did my transaction fail to go through?</h2>
            <p>
              When receiving a transfer, ensure that your wallet address, receiving network and passphrase provided
              match what the sender has sent. When sending a transfer, ensure that the correct recipient address is
              inputted.
            </p>
          </div>
          <div className=" space-y-2">
            <h2 className="font-bold text-xl">Q: Can I change the recipient wallet address?</h2>
            <p>
              You can input a different recipient wallet address by cancelling any live transfers and initiating a new
              transfer to a different wallet address.
            </p>
          </div>
          <div className=" space-y-2">
            <h2 className="font-bold text-xl">
              Q: Can I send/escrow NFTs on your platform? Can I send a token that is not on your list?
            </h2>
            <p>
              Unfortunately not at the moment, however we have plans to expand the number and types of assets that can
              be transferred on our platform in future. Let us know what you would like to see first!
            </p>
          </div>
          <div className=" space-y-2">
            <h2 className="font-bold text-xl">Q: What are the fees you charge?</h2>
            <p>For Send/Receive function, we charge 0.5% on the sender’s side.</p>
            <p>For Escrow(OTC) function, we charge 1% each on both trading parties.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
