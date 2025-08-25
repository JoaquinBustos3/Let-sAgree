import '../component-styles/Categories.css';

function Categories() {
  return (
    <div className="categories-container">
      <div className="inner-container">
        <div className="box">1</div>
        <div className="box">2</div>
        <div className="box">3</div>
        <div className="box">4</div>
        <div className="split-box">
          <div className="box split-box-top">5A</div>
          <div className="box split-box-bottom">5B</div>
        </div>
        <div className="box">6</div>
        <div className="box">7</div>
        <div className="box">8</div>
        <div className="box">9</div>
      </div>
    </div>
  );
}

export default Categories;
