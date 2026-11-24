import type { Decorator, Preview } from "@storybook/react-vite"
import "../src/styles/globals.css"

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals["theme"] === "dark" ? "dark" : "light"
  const root = document.documentElement

  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }

  return Story()
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global color theme for components",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [withTheme],
  parameters: {
    layout: "padded",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
