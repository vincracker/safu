// theme.js
import { switchAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, extendTheme } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(switchAnatomy.keys);

const boxy = definePartsStyle({
  track: {
    borderRadius: "md",
    p: 1
  }
});

const switchTheme = defineMultiStyleConfig({ variants: { boxy } });

const theme = extendTheme({
  components: {
    Switch: switchTheme
  }
});

export default theme;
