import FadeTransition from "../_lib/components/fade-transition";

const PageTransitionLayout = ({ children }: { children: React.ReactNode }) => {
  return <FadeTransition>{children}</FadeTransition>;
};

export default PageTransitionLayout;
