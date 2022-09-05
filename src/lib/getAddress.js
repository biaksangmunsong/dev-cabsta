const getAddress = data => {

    const reverseGeocodedData = data
    const results = {
        street_address: "",
        subpremise: "",
        premise: "",
        park: "",
        point_of_interest: "",
        intersection: "",
        airport: "",
        route: "",
        sublocality: "",
        neighborhood: "",
        locality: "",
        postal_code: "",
        administrative_area_level_2: "",
        administrative_area_level_1: "",
        country: ""
    }
    const address = {
        level5: "", // street name / park / building name etc.
        level4: "", // area / colony
        level3: "", // town / city
        level2: "", // state
        level1: ""  // country
    }

    for (let i = 0; i < reverseGeocodedData.results.length; i++){
        const r = reverseGeocodedData.results[i]
        for (let x = 0; x < r.address_components.length; x++){
            const ac = r.address_components[x]

            if (ac.types.includes("street_address")){
                results.street_address = ac.long_name
            }
            if (ac.types.includes("subpremise")){
                results.subpremise = ac.long_name
            }
            if (ac.types.includes("premise")){
                results.premise = ac.long_name
            }
            if (ac.types.includes("park")){
                results.park = ac.long_name
            }
            if (ac.types.includes("point_of_interest")){
                results.point_of_interest = ac.long_name
            }
            if (ac.types.includes("intersection")){
                results.intersection = ac.long_name
            }
            if (ac.types.includes("airport")){
                results.airport = ac.long_name
            }
            if (ac.types.includes("route")){
                results.route = ac.long_name
            }
            if (ac.types.includes("sublocality")){
                results.sublocality = ac.long_name
            }
            if (ac.types.includes("neighborhood")){
                results.neighborhood = ac.long_name
            }
            if (ac.types.includes("locality")){
                results.locality = ac.long_name
            }
            if (ac.types.includes("administrative_area_level_2")){
                results.administrative_area_level_2 = ac.long_name
            }
            if (ac.types.includes("administrative_area_level_1")){
                results.administrative_area_level_1 = ac.long_name
            }
            if (ac.types.includes("country")){
                results.country = ac.long_name
            }
            if (ac.types.includes("postal_code")){
                results.postal_code = ac.long_name
            }
        }
    }

    if (results.street_address){
        address.level5 = results.street_address
    }
    else if (results.subpremise){
        address.level5 = results.subpremise
    }
    else if (results.premise){
        address.level5 = results.premise
    }
    else if (results.park){
        address.level5 = results.park
    }
    else if (results.point_of_interest){
        address.level5 = results.point_of_interest
    }
    else if (results.intersection){
        address.level5 = results.intersection
    }
    else if (results.airport){
        address.level5 = results.airport
    }
    else if (results.route){
        address.level5 = results.route
    }

    if (results.sublocality){
        address.level4 = results.sublocality
    }
    else if (results.neighborhood){
        address.level4 = results.neighborhood
    }

    if (results.locality){
        address.level3 = results.locality
    }
    
    if (results.administrative_area_level_1){
        address.level2 = results.administrative_area_level_1
    }

    if (results.country){
        address.level1 = results.country
    }
    
    return `${address.level5}, ${address.level4}, ${address.level3}, ${address.level2}, ${address.level1}`

}

export default getAddress