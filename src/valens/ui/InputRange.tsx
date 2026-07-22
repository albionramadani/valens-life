"use client"
import { getTrackBackground, Range } from "react-range";
// prop type 
type IProps = {
  STEP:number;
  MIN:number;
  MAX:number;
  values:number[];
  handleChanges: (val: number[]) => void
}
const InputRange = ({ STEP, MIN, MAX, values, handleChanges }:IProps) => {
  return (
    <>
      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={values}
        onChange={(vals) => handleChanges(vals)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            key='track'
            style={{
              ...props.style,
              height: '3px',
              width: '100%',
              background: getTrackBackground({
                values: values,
                colors: ["#0D9B4D", "#0D9B4D", "#EBEFF4"],
                min: MIN,
                max: MAX
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props,index }) => (
          <div
            {...props}
            key={`thumb-${index}`}
            style={{
              ...props.style,
              height: '15px',
              width: '15px',
              borderRadius:'50px',
              backgroundColor: "#0D9B4D",
              outline: "none"
              
            }}
          />
        )}
      />
    </>
  );
};


export default InputRange;
