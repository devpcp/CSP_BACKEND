


const config = require('../../config');
const Product = require('../../models/Product/Product');
const updateMasterPathCodeIdFromCadCode = async () => {

    var data = [
        {
            "master_path_code_id": "530941",
            "master_path_code_id from cad_code": "193056",
            "cad_code": "193056_101"
        },
        {
            "master_path_code_id": "579939",
            "master_path_code_id from cad_code": "420895",
            "cad_code": "420895_101"
        },
        {
            "master_path_code_id": "397891",
            "master_path_code_id from cad_code": "897924",
            "cad_code": "897924_103"
        },
        {
            "master_path_code_id": "845259",
            "master_path_code_id from cad_code": "139513",
            "cad_code": "139513_101"
        },
        {
            "master_path_code_id": "77968",
            "master_path_code_id from cad_code": "579939",
            "cad_code": "579939_101"
        },
        {
            "master_path_code_id": "797694",
            "master_path_code_id from cad_code": "307669",
            "cad_code": "307669_101"
        },
        {
            "master_path_code_id": "497307",
            "master_path_code_id from cad_code": "292667",
            "cad_code": "292667_101"
        },
        {
            "master_path_code_id": "568477",
            "master_path_code_id from cad_code": "821706",
            "cad_code": "821706_101"
        },
        {
            "master_path_code_id": "755719",
            "master_path_code_id from cad_code": "518184",
            "cad_code": "518184_101"
        },
        {
            "master_path_code_id": "635236",
            "master_path_code_id from cad_code": "636793",
            "cad_code": "636793_101"
        },
        {
            "master_path_code_id": "88877",
            "master_path_code_id from cad_code": "441445",
            "cad_code": "441445_101"
        },
        {
            "master_path_code_id": "592450",
            "master_path_code_id from cad_code": "658195",
            "cad_code": "658195_101"
        },
        {
            "master_path_code_id": "84161",
            "master_path_code_id from cad_code": "603265",
            "cad_code": "603265_101"
        },
        {
            "master_path_code_id": "193056",
            "master_path_code_id from cad_code": "592450",
            "cad_code": "592450_101"
        },
        {
            "master_path_code_id": "54571",
            "master_path_code_id from cad_code": "084161",
            "cad_code": "084161_101"
        },
        {
            "master_path_code_id": "23423458",
            "master_path_code_id from cad_code": "986404",
            "cad_code": "986404_101"
        },
        {
            "master_path_code_id": "003853",
            "master_path_code_id from cad_code": "497307",
            "cad_code": "497307_101"
        },
        {
            "master_path_code_id": "774369",
            "master_path_code_id from cad_code": "087823",
            "cad_code": "087823_101"
        },
        {
            "master_path_code_id": "833296",
            "master_path_code_id from cad_code": "234596",
            "cad_code": "234596_101"
        },
        {
            "master_path_code_id": "420712",
            "master_path_code_id from cad_code": "797694",
            "cad_code": "797694_101"
        },
        {
            "master_path_code_id": "521409",
            "master_path_code_id from cad_code": "698455",
            "cad_code": "698455_101"
        },
        {
            "master_path_code_id": "382734",
            "master_path_code_id from cad_code": "813877",
            "cad_code": "813877_101"
        },
        {
            "master_path_code_id": "441445",
            "master_path_code_id from cad_code": "003853",
            "cad_code": "003853_101"
        },
        {
            "master_path_code_id": "292316",
            "master_path_code_id from cad_code": "845259",
            "cad_code": "845259_101"
        },
        {
            "master_path_code_id": "281282",
            "master_path_code_id from cad_code": "397891",
            "cad_code": "397891_101"
        },
        {
            "master_path_code_id": "643635",
            "master_path_code_id from cad_code": "064441",
            "cad_code": "064441_101"
        },
        {
            "master_path_code_id": "986404",
            "master_path_code_id from cad_code": "471253",
            "cad_code": "471253_101"
        },
        {
            "master_path_code_id": "985206",
            "master_path_code_id from cad_code": "330228",
            "cad_code": "330228_101"
        }
    ]



    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        await Product.update(
            {
                master_path_code_id: element['master_path_code_id from cad_code'],
                custom_path_code_id: element['master_path_code_id from cad_code']
            },
            { where: { master_path_code_id: element['master_path_code_id'] } }
        )

    }
}

updateMasterPathCodeIdFromCadCode()