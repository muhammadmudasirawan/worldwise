import { useSearchParams } from "react-router-dom";

function useUrlPostion() {
  const [searchPharams] = useSearchParams();
  const lat = searchPharams.get("lat");
  const lng = searchPharams.get("lng");

  return [lat, lng];
}

export default useUrlPostion;
