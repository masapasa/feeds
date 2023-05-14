import ShouldRender from "./ShouldRender";
import Skeleton, { SkeletonProps } from "./Skeleton";

type Props = SkeletonProps & {
  children?: string;
  className?: string;
  loading?: boolean;
};

/**
 * This component receives HTML and renders it on the page.
 *
 *  It is intended to be used to render a post or a comment's body,
 *  which is parsed from markdown into HTML in the server. (tRPC router)
 */
const HTMLBody: React.FC<Props> = ({
  children,
  className,
  loading,
  ...props
}) => {
  return (
    <>
      <ShouldRender if={loading}>
        <Skeleton {...props} />
      </ShouldRender>

      <ShouldRender if={!loading}>
        <div
          className={`${className} markdown__content prose-emerald break-words dark:prose-invert dark:prose-hr:border-neutral-700`}
          dangerouslySetInnerHTML={{ __html: children || "" }}
        />
      </ShouldRender>
    </>
  );
};

export default HTMLBody;
