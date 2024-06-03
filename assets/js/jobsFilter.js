const jobs = [
    {
        "_id": "663268dff1d39ef65549d57a",
        "recruiter": "662fb3f2a7a9094850bf422c",
        "title": "Unpacking Storage Supply",
        "info": "We are hiring for single time job - unpacking storage supply!",
        "images": [],
        "salary": 50,
        "creationDate": "2024-05-01T16:06:26.110Z",
        "fromDate": "2024-06-01T12:00:00.000Z",
        "toDate": "2024-06-01T12:30:00.000Z",
        "status": 1
    },
    {
        "_id": "665d93de2e6422a04f6ad4e4",
        "recruiter": "662fb3f2a7a9094850bf422c",
        "title": "Distributing flyers",
        "info": "We are hiring for single time job - flyers distribution!",
        "images": [],
        "salary": 35,
        "creationDate": "2024-06-03T09:55:23.702Z",
        "fromDate": "2024-06-10T12:00:00.000Z",
        "toDate": "2024-06-10T12:30:00.000Z",
        "status": 1
    }
];
const fetchData = document.getElementById('fetchData');
const searchBar = document.getElementById('searchBar');
fetchData.innerHTML = JSON.stringify(jobs);
searchBar.addEventListener("change", (e) => {
    let userVal = e.target.value;
    if(userVal.length === 0){
        fetchData.innerHTML = JSON.stringify(jobs);
    }else{
        fetchData.innerHTML = JSON.stringify(jobs.filter((job) => {
            if(job.title.includes(userVal) || job.info.includes(userVal))
                return true;
            return false;
        }));
    }
});
