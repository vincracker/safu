export default function About() {
  return (
    <section className="w-screen h-[calc(100vh-7.5rem)] font-Lato">
      <div className="w-11/12 md:max-w-7xl h-full mx-auto space-y-8 ">
        <h1 className="text-primary  font-medium text-2xl">About SafuSend</h1>
        <div className="lg:w-2/3 mx-auto space-y-8 ">
          <p className="  ">
            SafuSend's founders have always found it a pain to send funds on chain safely and securely without having to
            go through back and forth with recipients. With no existing solution to this problem, we decided to build
            one ourselves!
          </p>
          <p>
            We're always open to feedback to keep improving the product, please do let us know if you have any ideas or
            suggestions!
          </p>
        </div>
      </div>
    </section>
  );
}
