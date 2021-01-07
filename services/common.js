const { data } = require("../data/user");


const common = () => {
    const fetchWithPredicate = (data, predicate, key) => {
        return data[key].filter(predicate) ? data[key].filter(predicate) : [];
    };
    const addByKey = (item, key) =>{
        data[key] ? data[key].push(item) : data[key];
        return fetchWithPredicate(data, ((i) => i === item), key);
    }
    return {
        fetchWithPredicate,
        addByKey
    };

};

module.exports=common();
