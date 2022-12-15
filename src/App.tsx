import { Buffer } from "buffer";

import { Layout } from "antd";

// import background from "./assets/images/background.jpg";
import web3Boilerplate_logo from "./assets/images/web3Boilerplate_logo.png";
import ConnectAccount from "./components/Account/ConnectAccount";
import ChainSelector from "./components/ChainSelector";
import DisplayPane from "./components/displayPane/DisplayPane";
import "./App.css";
import { useWindowWidthAndHeight } from "./hooks/useWindowWidthAndHeight";

const { Header, Footer } = Layout;

const styles = {
  layout: {
    // backgroundImage: `url(${background})`,
    // backgroundPosition: "center",
    // backgroundSize: "cover",
    // backgroundRepeat: "no-repeat",
    backgroundImage: "linear-gradient(to right, #0f0c29, #302b63, #24243e)",
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
  }
} as const;

function App() {
  if (!window.Buffer) window.Buffer = Buffer;

  return (
    <Layout style={styles.layout}>
      <Header style={{ ...styles.header, justifyContent: "space-between" }}>
        {/* <Logo /> */}
        <div></div>
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

export const Logo = () => {
  const [width] = useWindowWidthAndHeight();
  const isMobile = width <= 768;
  return (
    <>
      {isMobile ? (
        <div style={{ paddingTop: "30px" }}>
          <img src={web3Boilerplate_logo} alt="web3Boilerplate_logo" width="80px" />;
        </div>
      ) : (
        <div style={{ paddingTop: "45px" }}>
          <img src={web3Boilerplate_logo} alt="web3Boilerplate_logo" width="120px" />;
        </div>
      )}
    </>
  );
};

export default App;
