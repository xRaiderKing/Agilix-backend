import colors from 'colors'
import server from './server';

const port = process.env.PORT || 3000

server.listen(port, ()  => {
    console.log(colors.white.italic.bold.bgGreen(`REST API Funcionando en el puerto ${port}`))
})