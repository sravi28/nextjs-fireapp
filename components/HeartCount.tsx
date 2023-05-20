import { formatNumber } from "../lib/utils";

export default function HeartCount({ heartCount }: { heartCount: number }) {
  return (
    <p className="heart-count" title={"Hearts: " + heartCount}>
      💗 <strong>{`${formatNumber(heartCount)}`}</strong>
    </p>
  );
}
