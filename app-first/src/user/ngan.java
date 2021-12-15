public class Book extends Shape {

    private int id;
    private String name;
    private double price;


    public Book() {
        super();
    }


    public Book(int id ,String name ,double price) {
        super();
        this.id  = id;
        this.name = name;
        this.price = price;
    }
    
    public double getName() {
        return name;
    }

    
    public double getPrice() {
        return price;
    }
    
    @Override
    public String toString() {
        return "Book[id=" + id + ",name=" + name + ",price" +price +  "]";
    }
} 
