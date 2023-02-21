import { useState } from "react";

// import { switchAnatomy } from "@chakra-ui/anatomy";
import { Switch, Text, HStack } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";

// import { useWindowWidthAndHeight } from "../../hooks/useWindowWidthAndHeight";
import { Lock, Unlock } from "./components";

const styles = {
  container: {
    // boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
    // borderColor: "rgb(31,57,106)",
    border: "solid 4px rgb(31,57,106)",
    width: "50%",
    minWidth: "340px",
    maxWidth: "900px",
    textAlign: "center",
    margin: "auto",
    padding: "30px 0",
    borderRadius: "15px"
  },
  title: {
    color: "white",
    fontWeight: 600,
    fontSize: "30px",
    marginBottom: "10px"
  },
  content: {
    width: "85%",
    margin: "auto",
    fontSize: "17px"
  },
  action: {
    display: "inline-flex",
    width: "100%",
    // flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px"
  },
  switch: {
    display: "inline-flex",
    width: "100%",
    // flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: "20px",
    marginBottom: "2%"
  }
} as const;

const DisplayPane: React.FC = () => {
  const { isActive } = useWeb3React();
  // const [width] = useWindowWidthAndHeight();
  // const isMobile = width <= 768;
  const [isLock, setIsLock] = useState(true);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* <Status isActivating={isActivating} isActive={isActive} /> */}
        {/* <Infos chainId={chainId} /> */}

        {isActive && (
          <>
            <div style={styles.switch}>
              <HStack spacing={3}>
                <Text fontSize="2xl" fontWeight={800} opacity={isLock ? 1 : 0.3}>
                  Send
                </Text>
                <Switch size="lg" onChange={() => setIsLock(!isLock)} variant={"boxy"} />
                <Text fontSize="2xl" fontWeight={800} opacity={isLock ? 0.3 : 1}>
                  Receive
                </Text>
              </HStack>
            </div>
            {isLock ? (
              <div style={styles.action}>
                <Lock />
              </div>
            ) : (
              <div style={styles.action}>
                <Unlock />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DisplayPane;
