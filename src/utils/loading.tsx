const PageLoader = (showProgressBar:any) => {
    if(showProgressBar.showProgressBar){
        return null
    }
    return(
<>
<div id="overlay">
</div>
<div className="spinner"></div>

</>        
    )    
};

export default PageLoader;

