const buildUrl = (config) => {
    const queryParams = new URLSearchParams(
        Object.entries(config.params).map(([key, value]) => [key, String(value)])
    );
    return `${config.baseUrl}?${queryParams.toString()}`;
}
const options = {
    method: 'GET',
    headers: {
        'accept': 'application/json',
        'Authorization': "Bearer zb4uZjhJ/X8DuAsF/EmGyScy9wQLs6Ty4Kou9jXF6Ep4zg4IIfFj+xntAA=="
    }

};


//
// 获取抖音直播间商品
const getDouyinLiveProducts = async ({roomid,author_id}) => {    
    const url = {
        baseUrl: '/tikhub',
        params: { roomid,author_id }
    };
   
    const response = await fetch(buildUrl(url), options)
    const result = await response.json();
    return result
}

export {
   getDouyinLiveProducts
}
