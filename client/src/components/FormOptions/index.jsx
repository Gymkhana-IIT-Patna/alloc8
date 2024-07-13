function Options({ array }) {
  return (
    <>
      <option value="Select" disabled key={0}>
        Select
      </option>
      {array.map((e, i) => {
        return (
          <>
            <option value={`${e}`} key={i+1}>{`${e}`}</option>;
          </>
        );
      })}
    </>
  );
}

export default Options;
