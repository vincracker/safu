import { Buffer } from "buffer";

import { Button, Layout } from "antd";

// import background from "./assets/images/background.jpg";
// import web3Boilerplate_logo from "./assets/images/web3Boilerplate_logo.png";
import ConnectAccount from "./components/Account/ConnectAccount";
import ChainSelector from "./components/ChainSelector";
import DisplayPane from "./components/displayPane/DisplayPane";
import "./App.css";
// import { useWindowWidthAndHeight } from "./hooks/useWindowWidthAndHeight";

const { Header, Footer } = Layout;

const styles = {
  layout: {
    // backgroundImage: `url(${background})`,
    // backgroundPosition: "center",
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat",
    backgroundImage: "white",
    width: "100vw",
    height: "100vh",
    overflow: "auto",
    fontFamily: "Sora, sans-serif"
  },
  header: {
    position: "fixed",
    zIndex: 1,
    width: "100%",
    backgroundColor: "transparent",
    color: "rgb(31,57,106)",
    display: "flex",
    alignItems: "center",
    padding: "0px 20px",
    paddingTop: "15px"
  },
  headerRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    paddingRight: "10px",
    fontSize: "15px",
    fontWeight: "600"
  },
  headerLeft: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    paddingLeft: "20px",
    fontSize: "15px"
    // fontWeight: "600"
  },
  content: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    color: "#041836",
    marginTop: "100px",
    padding: "10px",
    overflow: "auto"
  },
  footer: {
    position: "fixed",
    textAlign: "center",
    width: "100%",
    bottom: "0",
    color: "white",
    backgroundColor: "transparent"
  },
  button: {
    fontWeight: "600",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    color: "rgb(31,57,106)"
  },
  inactiveBtn: {
    fontWeight: "400",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    color: "rgb(31,57,106)"
  }
} as const;

function App() {
  if (!window.Buffer) window.Buffer = Buffer;

  return (
    <Layout style={styles.layout}>
      <Header style={{ ...styles.header, justifyContent: "space-between" }}>
        <div style={styles.headerLeft}>
          <Button style={{ ...styles.button }} type="link">
            Send/Receive
          </Button>
          <Button style={{ ...styles.inactiveBtn }} type="link">
            OTC/Escrow
          </Button>
          <Button style={{ ...styles.inactiveBtn }} type="link">
            My Transfer
          </Button>
        </div>
        <div style={styles.headerRight}>
          <ChainSelector />
          <ConnectAccount />
        </div>
      </Header>
      <div style={styles.content}>
        <DisplayPane />
      </div>

      <Footer style={styles.footer}>
        <div style={{ display: "block" }}>Footer</div>
      </Footer>
    </Layout>
  );
}

// export const Logo = () => {
//   const [width] = useWindowWidthAndHeight();
//   const isMobile = width <= 768;
//   return (
//     <>
//       {isMobile ? (
//         <div style={{ paddingTop: "30px" }}>
//           <img src={web3Boilerplate_logo} alt="web3Boilerplate_logo" width="80px" />
//         </div>
//       ) : (
//         <div style={{ paddingTop: "45px" }}>
//           <img src={web3Boilerplate_logo} alt="web3Boilerplate_logo" width="120px" />
//         </div>
//       )}
//     </>
//   );
// };

export default App;
