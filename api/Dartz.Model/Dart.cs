namespace Dartz.Model
{
    public class Dart
    {
        public int ID { get; set; }

        public int TurnID { get; set; }
        public virtual Turn Turn { get; set; } = null!;

        /// <summary>
        /// Which dart in the turn (1, 2, or 3).
        /// </summary>
        public int DartNumber { get; set; }

        /// <summary>
        /// The base score of the segment hit (0-20, or 25 for bull).
        /// </summary>
        public int BaseScore { get; set; }

        /// <summary>
        /// 1 = Single, 2 = Double, 3 = Triple.
        /// </summary>
        public int Multiplier { get; set; }
    }
}
