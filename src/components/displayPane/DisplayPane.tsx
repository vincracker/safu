import { useState } from "react";

import { Switch, Text, HStack } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";

// import { useWindowWidthAndHeight } from "../../hooks/useWindowWidthAndHeight";
import { Status, Lock, Unlock } from "./components";

const styles = {
  container: {
    background: "#000",
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
    width: "80%",
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
    fontSize: "17px",
    color: "white"
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
    justifyContent: "center",
    gap: "20px",
    marginBottom: "2%"
  }
} as const;

const DisplayPane: React.FC = () => {
  const { isActivating, isActive } = useWeb3React();
  // const [width] = useWindowWidthAndHeight();
  // const isMobile = width <= 768;
  const [isLock, setIsLock] = useState(true);

  return (
    <div style={styles.container}>
      <div style={styles.title}>SaFuSend</div>
      <div style={styles.content}>
        <Status isActivating={isActivating} isActive={isActive} />
        {/* <Infos chainId={chainId} /> */}

        {isActive && (
          <>
            <div style={styles.switch}>
              <HStack spacing={3}>
                <Text fontSize="2xl" fontWeight={800} opacity={isLock ? 1 : 0.3}>
                  Lock
                </Text>
                <Switch size="lg" onChange={() => setIsLock(!isLock)} colorScheme="purple" />
                <Text fontSize="2xl" fontWeight={800} opacity={isLock ? 0.3 : 1}>
                  Unlock
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
