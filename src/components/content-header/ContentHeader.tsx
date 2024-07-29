

const ContentHeader = ({ title }: { title: string }) => {
  return (
    <section className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6 ">
            <h1><strong>{title}</strong></h1>
          </div>
          <div className="col-sm-6">
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentHeader;
