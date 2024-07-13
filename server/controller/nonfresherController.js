const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


async function showDetails(req, res){

    const { rollnum } = req.query;
    try {
        
        const student = await prisma.students.findUnique({
          where: { rollnum }
        });
    
        if (student && student.allocated) {

            const roommates = await prisma.students.findMany({
                where: {
                    hostel: student.hostel,
                    roomnum: student.roomnum
                },
                select: {
                    rollnum: true,
                   
                    name: true 
                }});
            


          return res.status(200).json({
            hostel: student.hostel,
            roomNum: student.roomnum,
            room: student.room,
            occupancy: student.occupancy,
            roommates,
          });
        } else {
            res.status(400).json({error:"kindly wait for allocation !"});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }

    
}
async function getRoom(req,res){
 //we need live details of hostel correcpsonding to each student case wise
 // render them 
 //along with status of the rooms in that particular hostel show the list of all rooms which can be booked by that particular student 
 // use the Room db find which are allocated by attributes
}
async function roomBooking(req,res){
    //the boooking via redis or mutex in locked mechanism for smooth bookingg
}


module.exports = {
    showDetails,
    getRoom,
    roomBooking,

};